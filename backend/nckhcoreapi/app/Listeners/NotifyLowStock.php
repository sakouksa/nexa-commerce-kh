<?php

namespace App\Listeners;

use App\Events\LowStockAlert;
use App\Events\LowStockDetected;
use App\Services\TelegramService;

class NotifyLowStock
{
    public function handle(LowStockAlert|LowStockDetected $event): void
    {
        $shop = $event->shop;
        if (! $shop) {
            return;
        }

        try {
            TelegramService::notifyShopLowStockFull($shop, $event->lowStockProducts);
        } catch (\Throwable $e) {
            // Gracefully catch telegram errors
        }
    }
}
