<?php

namespace App\Services\Payment;

use App\Models\Order;
use App\Models\Shop;
use App\Services\AbaService;

class AbaPayService
{
    public function generateCheckout(Order $order): array
    {
        return AbaService::generateCheckoutUrl($order);
    }

    public function checkTransaction(Shop $shop, string $transactionId): array
    {
        return AbaService::checkTransactionForShop($shop, $transactionId);
    }

    public function isConfigured(Shop $shop): bool
    {
        return AbaService::isConfigured($shop);
    }

    public function generateTransactionId(string $orderNumber = ''): string
    {
        return AbaService::generateTransactionId($orderNumber);
    }
}
