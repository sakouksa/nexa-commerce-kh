<?php

namespace App\Services\Telegram;

use App\Models\Order;
use App\Models\Shop;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class TelegramService
{
    public static function sendTelegramMessage(string $botToken, string $chatId, string $text): bool
    {
        if (empty($botToken) || empty($chatId)) {
            return false;
        }

        $url = "https://api.telegram.org/bot{$botToken}/sendMessage";

        // Try 1: HTML parse mode
        try {
            $resp = Http::timeout(15)->post($url, [
                'chat_id' => $chatId,
                'text' => $text,
                'parse_mode' => 'HTML',
                'disable_web_page_preview' => true,
            ]);
            if ($resp->successful() && ($resp->json('ok') === true)) {
                return true;
            }
        } catch (Exception $e) {
            // fallback to plain
        }

        // Try 2: Plain text fallback
        try {
            $resp = Http::timeout(15)->post($url, [
                'chat_id' => $chatId,
                'text' => strip_tags($text),
                'disable_web_page_preview' => true,
            ]);

            return $resp->successful() && ($resp->json('ok') === true);
        } catch (Exception $e) {
            return false;
        }
    }

    public static function getBotUsername(string $botToken): ?string
    {
        if (empty($botToken)) {
            return null;
        }
        try {
            $resp = Http::timeout(10)->get("https://api.telegram.org/bot{$botToken}/getMe");
            if ($resp->successful()) {
                return $resp->json('result.username');
            }
        } catch (Exception $e) {
            return null;
        }

        return null;
    }

    public static function getWebhookInfo(string $botToken): array
    {
        if (empty($botToken)) {
            return [];
        }
        try {
            $resp = Http::timeout(10)->get("https://api.telegram.org/bot{$botToken}/getWebhookInfo");

            return $resp->json() ?? [];
        } catch (Exception $e) {
            return [];
        }
    }

    public static function setWebhook(string $botToken, string $url): array
    {
        if (empty($botToken)) {
            return [];
        }
        try {
            $resp = Http::timeout(10)->post("https://api.telegram.org/bot{$botToken}/setWebhook", [
                'url' => $url,
            ]);

            return $resp->json() ?? [];
        } catch (Exception $e) {
            return [];
        }
    }

    public static function verifyTelegramLogin(string $botToken, array $data): bool
    {
        $hash = $data['hash'] ?? '';
        if (empty($hash)) {
            return false;
        }

        $checkData = [];
        foreach ($data as $k => $v) {
            if ($k !== 'hash' && $k !== 'shop_id' && $v !== null && $v !== '') {
                $checkData[] = "{$k}={$v}";
            }
        }
        sort($checkData);
        $dataCheckString = implode("\n", $checkData);

        $secretKey = hash('sha256', $botToken, true);
        $computedHash = hash_hmac('sha256', $dataCheckString, $secretKey);

        if (! hash_equals($computedHash, $hash)) {
            return false;
        }

        $authDate = (int) ($data['auth_date'] ?? 0);
        if ($authDate > 0 && (time() - $authDate) > 86400) {
            return false; // older than 24h
        }

        return true;
    }

    public static function ensureShopProfile(Shop $shop): array
    {
        $tg = $shop->telegram_dict();
        $changed = false;

        if (empty($tg['profile_id'])) {
            $tg['profile_id'] = 'SHOP'.$shop->id.'-'.strtoupper(Str::random(8));
            $changed = true;
        }
        if (empty($tg['secret_key'])) {
            $tg['secret_key'] = Str::random(16);
            $changed = true;
        }
        if (! isset($tg['linked_chats']) || ! is_array($tg['linked_chats'])) {
            $tg['linked_chats'] = [];
            $changed = true;
        }

        if ($changed) {
            $shop->telegram_settings = json_encode($tg, JSON_UNESCAPED_UNICODE);
            $shop->save();
        }

        return $tg;
    }

    public static function sendShopNotification(Shop $shop, string $text): bool
    {
        $tg = $shop->telegram_dict();
        $botToken = trim($tg['bot_token'] ?? '');
        if (empty($botToken)) {
            return false;
        }

        $chatIds = [];
        if (! empty($tg['chat_id'])) {
            $chatIds[] = (string) $tg['chat_id'];
        }
        foreach ($tg['linked_chats'] ?? [] as $c) {
            if (! empty($c)) {
                $chatIds[] = (string) $c;
            }
        }
        $chatIds = array_unique($chatIds);

        $sent = false;
        foreach ($chatIds as $cid) {
            if (self::sendTelegramMessage($botToken, $cid, $text)) {
                $sent = true;
            }
        }

        return $sent;
    }

    public static function sendVerificationCode(string $botToken, $chatId, string $code): bool
    {
        $text = "🔐 <b>លេខកូដផ្ទៀងផ្ទាត់ (Verification Code):</b>\n\n".
                "<code>{$code}</code>\n\n".
                'លេខកូដនេះមានសុពលភាពរយៈពេល ៥ នាទី។ សូមកុំចែករំលែកលេខកូដនេះទៅកាន់អ្នកដទៃ។';

        return self::sendTelegramMessage($botToken, (string) $chatId, $text);
    }

    public static function notifyShopNewOrder(Shop $shop, string $orderNumber, float $amount, string $currency, string $customerName): bool
    {
        $formattedAmount = number_format($amount, 2);
        $shopName = $shop->shop_name ?: $shop->username;
        $text = "🛒 <b>New Order Placed!</b>\n\n".
                "🏪 <b>Shop:</b> {$shopName}\n".
                "🧾 <b>Order:</b> #{$orderNumber}\n".
                "💰 <b>Amount:</b> {$formattedAmount} {$currency}\n".
                "👤 <b>Customer:</b> {$customerName}";

        return self::sendShopNotification($shop, $text);
    }

    public static function notifyShopPaymentSuccessFull(Shop $shop, Order $order, ?array $stockSummary = null): bool
    {
        $formattedAmount = number_format((float) $order->total, 2);
        $shopName = $shop->shop_name ?: $shop->username;
        $customerName = $order->customer_name ?: 'Customer';
        $customerPhone = $order->customer_phone ?: '-';
        $customerAddress = $order->customer_address ?: '-';
        $now = date('Y-m-d H:i:s');

        $lines = [
            '✅ <b>Payment Confirmed!</b>',
            '',
            "🏪 <b>Shop:</b> {$shopName}",
            "🧾 <b>Order:</b> #{$order->order_number}",
            "💰 <b>Amount:</b> {$formattedAmount} {$order->currency}",
            '💳 <b>Method:</b> '.strtoupper($order->payment_method),
            "👤 <b>Customer:</b> {$customerName} ({$customerPhone})",
            "📍 <b>Address:</b> {$customerAddress}",
            "🕒 <b>Time:</b> {$now}",
            '',
            '📦 <b>Items Ordered:</b>',
        ];

        foreach ($order->items as $item) {
            $vars = $item->getVariationsDict();
            $varStr = '';
            if (! empty($vars)) {
                $varParts = [];
                foreach ($vars as $k => $v) {
                    $varParts[] = "{$k}: {$v}";
                }
                $varStr = ' ('.implode(', ', $varParts).')';
            }

            $deductInfo = '';
            if ($stockSummary && isset($stockSummary[$item->product_id])) {
                $rem = $stockSummary[$item->product_id]['remaining'] ?? null;
                if ($rem !== null) {
                    $deductInfo = " [ស្តុកនៅសល់: {$rem}]";
                }
            }

            $lines[] = "• {$item->product_name}{$varStr} x{$item->quantity} — $".number_format($item->price, 2)."{$deductInfo}";
        }

        return self::sendShopNotification($shop, implode("\n", $lines));
    }
}
