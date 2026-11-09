<?php

namespace App\Services\Payment;

use App\Models\Order;
use App\Models\Shop;
use App\Services\Documents\QrService;
use Exception;
use Illuminate\Support\Facades\Http;

class AbaService
{
    const KHQRCC_BASE = 'https://khqr.cc/api';

    public static function abaHash(string $secretKey, string $transactionId, string $amount, string $successUrl, string $remark): string
    {
        $raw = $secretKey.$transactionId.$amount.$successUrl.$remark;

        return sha1($raw);
    }

    public static function verifyHash(string $secretKey, string $transactionId): string
    {
        $raw = $secretKey.$transactionId;

        return sha1($raw);
    }

    public static function generateTransactionId(string $orderNumber = ''): string
    {
        return 'MS'.time().random_int(1000, 9999);
    }

    public static function getAbaConfig(Shop $shop): array
    {
        $aba = $shop->aba_dict();
        $profileId = trim($aba['profile_id'] ?? '');
        $secretKey = trim($aba['secret_key'] ?? '');

        return [$profileId, $secretKey];
    }

    public static function isConfigured(Shop $shop): bool
    {
        [$profileId, $secretKey] = self::getAbaConfig($shop);

        return ! empty($profileId) && ! empty($secretKey);
    }

    public static function requestDirectQr(string $profileId, string $secretKey, string $transactionId, string $amount, string $successUrl, string $remark): array
    {
        $url = self::KHQRCC_BASE."/{$profileId}/payment-gateway/v1/payments/qr-api-khqrcc";
        $payload = [
            'transaction_id' => $transactionId,
            'amount' => $amount,
            'success_url' => $successUrl,
            'remark' => $remark,
            'hash' => self::abaHash($secretKey, $transactionId, $amount, $successUrl, $remark),
        ];

        $response = Http::asForm()->timeout(30)->post($url, $payload);

        return $response->json() ?? [];
    }

    public static function checkTransaction(string $profileId, string $secretKey, string $transactionId): array
    {
        $url = self::KHQRCC_BASE."/{$profileId}/payment-gateway/v1/payments/check-transv2-khqrcc";
        $payload = [
            'transaction_id' => $transactionId,
            'hash' => self::verifyHash($secretKey, $transactionId),
        ];

        $response = Http::asForm()->timeout(30)->post($url, $payload);

        return $response->json() ?? [];
    }

    public static function buildCheckoutUrl(Order $order, Shop $shop, string $successUrl = '', string $errorUrl = '', string $cancelUrl = ''): array
    {
        [$profileId, $secretKey] = self::getAbaConfig($shop);
        if (empty($profileId) || empty($secretKey)) {
            throw new PaymentNotConfiguredException(
                'ABA Pay is not configured for this shop yet. '.
                'The shop owner must enter their ABA Pay Profile ID and Secret Key '.
                'in the Shop Dashboard → Payment Settings before customers can pay online.'
            );
        }

        $transactionId = self::generateTransactionId($order->order_number);
        $amount = sprintf('%.2f', (float) $order->total);
        $remark = "Payment for order #{$order->order_number}";

        $baseUrl = config('app.url');
        $successUrl = $successUrl ?: "{$baseUrl}/api/payments/aba/success?order_id={$order->id}";
        $errorUrl = $errorUrl ?: "{$baseUrl}/api/payments/aba/error?order_id={$order->id}";
        $hash = self::abaHash($secretKey, $transactionId, $amount, $successUrl, $remark);

        $checkoutUrl = self::KHQRCC_BASE."/payment/requestv2/{$profileId}?".
            "transaction_id={$transactionId}&amount={$amount}".
            '&success_url='.rawurlencode($successUrl).
            '&remark='.rawurlencode($remark).
            '&cancel_url='.rawurlencode($cancelUrl).
            "&hash={$hash}";

        $result = [
            'transaction_id' => $transactionId,
            'amount' => $amount,
            'remark' => $remark,
            'sandbox' => false,
            'checkout_url' => $checkoutUrl,
            'success_url' => $successUrl,
            'error_url' => $errorUrl,
            'hash' => $hash,
        ];

        try {
            $qr = self::requestDirectQr($profileId, $secretKey, $transactionId, $amount, $successUrl, $remark);
            if (($qr['responseCode'] ?? null) === 0 && ! empty($qr['data'])) {
                $emv = $qr['data']['qr'] ?? '';
                $qrUrl = $qr['data']['qr_url'] ?? '';
                if ($emv) {
                    $result['qr_content'] = $emv;
                    $result['qr_code_url'] = QrService::generateQrImage($emv, "qr_{$transactionId}.png");
                } elseif ($qrUrl) {
                    $result['qr_code_url'] = $qrUrl;
                }
            }
        } catch (Exception $e) {
            // direct QR is best-effort fallback to managed checkout
        }

        $result['qr'] = $result['qr_content'] ?? null;
        $result['qr_image'] = $result['qr_code_url'] ?? null;

        return $result;
    }

    public static function generateCheckoutUrl(Order $order): array
    {
        $shop = $order->shop;

        return self::buildCheckoutUrl($order, $shop);
    }

    public static function checkTransactionForShop(Shop $shop, string $transactionId): array
    {
        [$profileId, $secretKey] = self::getAbaConfig($shop);
        if (empty($profileId) || empty($secretKey)) {
            return [
                'verified' => false,
                'status' => 'not_configured',
                'error' => 'ABA Pay is not configured for this shop',
            ];
        }

        return self::checkTransaction($profileId, $secretKey, $transactionId);
    }

    public static function verifyPayment(Order $order, Shop $shop, string $transactionId = ''): array
    {
        [$profileId, $secretKey] = self::getAbaConfig($shop);
        if (empty($profileId) || empty($secretKey)) {
            return [
                'verified' => false,
                'status' => 'not_configured',
                'error' => 'ABA Pay is not configured for this shop',
            ];
        }

        $tx = trim($transactionId ?: ($order->transaction_id ?: ''));
        if (empty($tx)) {
            return [
                'verified' => false,
                'status' => 'pending',
                'detail' => 'No transaction id yet',
            ];
        }

        try {
            $result = self::checkTransaction($profileId, $secretKey, $tx);
        } catch (Exception $e) {
            return [
                'verified' => false,
                'status' => 'error',
                'detail' => $e->getMessage(),
                'transaction_id' => $tx,
            ];
        }

        if (($result['responseCode'] ?? null) === 0) {
            $data = $result['data'] ?? [];
            $status = strtolower((string) ($data['status'] ?? 'pending'));
            if ($status === 'success') {
                return [
                    'verified' => true,
                    'status' => 'success',
                    'amount' => $data['amount'] ?? null,
                    'transaction_id' => $tx,
                    'detail' => $result,
                ];
            }

            return [
                'verified' => false,
                'status' => $status,
                'transaction_id' => $tx,
                'detail' => $result,
            ];
        }

        return [
            'verified' => false,
            'status' => 'error',
            'detail' => $result['responseMessage'] ?? 'Unknown verification error',
            'transaction_id' => $tx,
        ];
    }
}
