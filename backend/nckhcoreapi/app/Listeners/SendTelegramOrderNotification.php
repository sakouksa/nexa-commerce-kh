<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Services\TelegramService;

class SendTelegramOrderNotification
{
    public function handle(OrderCreated $event): void
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
            if ($order->payment_status === 'paid') {
                TelegramService::notifyShopPaymentSuccessFull($shop, $order, $event->stockSummary);
            } else {
                TelegramService::notifyShopNewOrder($shop, $order);
            }
        } catch (\Throwable $e) {
            // gracefully catch telegram errors so main flow never breaks
        }
    }
}
