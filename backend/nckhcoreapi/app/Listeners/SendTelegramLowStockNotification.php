<?php

namespace App\Listeners;

use App\Events\LowStockAlert;
use App\Services\StockService;

class SendTelegramLowStockNotification
{
    public function handle(LowStockAlert $event): void
    {
        try {
            StockService::sendLowStockAlerts($event->shop);
        } catch (\Throwable $e) {
            // graceful catch
        }
    }
}
