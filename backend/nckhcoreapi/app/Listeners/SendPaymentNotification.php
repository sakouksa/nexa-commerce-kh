<?php

namespace App\Listeners;

use App\Events\OrderPaid;
use App\Events\PaymentVerified;
use App\Services\Telegram\TelegramService;

class SendPaymentNotification
{
    public function handle(OrderPaid|PaymentVerified $event): void
    {
        $order = $event->order;
        $shop = $order->shop;
        if (! $shop) {
            return;
        }

        $tg = method_exists($shop, 'telegram_dict') ? $shop->telegram_dict() : [];
        if (empty($tg['enabled'])) {
            return;
        }

        try {
            TelegramService::notifyShopPaymentSuccessFull($shop, $order);
        } catch (\Throwable $e) {
            // Gracefully catch telegram errors
        }
    }
}
