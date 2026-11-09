<?php

namespace App\Http\Controllers;

use App\Actions\Payments\CreateAbaCheckoutAction;
use App\Actions\Payments\VerifyAbaPaymentAction;
use App\Helpers\ShopHelper;
use App\Models\Order;
use App\Models\Shop;
use App\Services\AbaService;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class PaymentController extends Controller
{
    public function abaStatus(Request $request)
    {
        $shopId = (int) $request->input('shop_id');
        if (! $shopId) {
            throw new HttpException(400, 'shop_id is required');
        }

        $shop = Shop::find($shopId);
        if (! $shop) {
            throw new HttpException(404, 'Shop not found');
        }

        return response()->json([
            'shop_id' => $shopId,
            'configured' => AbaService::isConfigured($shop),
        ]);
    }

    public function abaCreate(Request $request, CreateAbaCheckoutAction $action)
    {
        $orderId = (int) $request->input('order_id');
        $res = $action->execute($orderId, [
            'success_url' => $request->input('success_url', ''),
            'error_url' => $request->input('error_url', ''),
            'cancel_url' => $request->input('cancel_url', ''),
        ]);

        return response()->json($res);
    }

    public function abaVerify(Request $request, VerifyAbaPaymentAction $action)
    {
        $orderId = (int) $request->input('order_id');
        $tx = $request->input('transaction_id');
        $result = $action->execute($orderId, $tx);

        return response()->json($result);
    }

    public function abaWebhook(Request $request)
    {
        $payload = $request->all();
        $tx = $payload['tran_id'] ?? $payload['transaction_id'] ?? null;
        $status = strtolower((string) ($payload['status'] ?? $payload['transaction_status'] ?? ''));

        if (! $tx) {
            return response()->json(['ok' => false, 'detail' => 'transaction not found']);
        }

        $order = Order::where('transaction_id', $tx)->first();
        if (! $order) {
            return response()->json(['ok' => false, 'detail' => 'transaction not found']);
        }

        if (in_array($status, ['successful', 'success', 'approved', 'paid'])) {
            OrderController::markPaid($order, $tx);
        } elseif (in_array($status, ['failed', 'cancelled', 'declined'])) {
            $order->payment_status = 'failed';
            $order->save();
        }

        return response()->json(['ok' => true]);
    }

    public function abaCallback(Request $request)
    {
        return $this->abaWebhook($request);
    }

    public function abaSuccess(Request $request)
    {
        $orderId = (int) $request->input('order_id');
        $order = Order::find($orderId);
        if ($order) {
            OrderController::markPaid($order, $order->transaction_id);
        }

        return response()->json([
            'ok' => true,
            'detail' => 'Payment success',
            'order_id' => $orderId,
        ]);
    }

    public function abaError(Request $request)
    {
        $orderId = (int) $request->input('order_id');
        $order = Order::find($orderId);
        if ($order) {
            $order->payment_status = 'failed';
            $order->save();
        }

        return response()->json([
            'ok' => false,
            'detail' => 'Payment error',
            'order_id' => $orderId,
        ]);
    }

    public function abaTest(Request $request)
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id');
        if (! $shopId) {
            throw new HttpException(400, 'shop_id is required');
        }

        ShopHelper::requireShopAccess($shopId, $user);

        $shop = Shop::find($shopId);
        if (! $shop) {
            throw new HttpException(404, 'Shop not found');
        }

        [$profileId, $secretKey] = AbaService::getAbaConfig($shop);
        if (empty($profileId) || empty($secretKey)) {
            throw new HttpException(400, 'ABA Pay profile ID and secret key are not configured');
        }

        $tranId = AbaService::generateTransactionId('TEST');
        $amount = '1.00';
        $successUrl = 'http://localhost:3000';
        $remark = 'Mini Shop platform test';
        $h = AbaService::abaHash($secretKey, $tranId, $amount, $successUrl, $remark);
        $checkoutUrl = AbaService::KHQRCC_BASE."/payment/requestv2/{$profileId}".
            "?transaction_id={$tranId}&amount={$amount}&success_url=".rawurlencode($successUrl).
            '&remark='.rawurlencode($remark)."&hash={$h}";

        return response()->json([
            'ok' => true,
            'profile_id' => $profileId,
            'transaction_id' => $tranId,
            'amount' => $amount,
            'hash' => $h,
            'checkout_url' => $checkoutUrl,
        ]);
    }
}
