<?php

namespace App\Services\Inventory;

use App\Models\Order;
use App\Models\Product;
use App\Models\Shop;
use App\Services\StockService as BaseStockService;

class StockService
{
    public function deductStockForOrder(Order $order): array
    {
        return BaseStockService::deductStockForOrder($order);
    }

    public function restoreStockForOrder(Order $order): array
    {
        return BaseStockService::restoreStockForOrder($order);
    }

    public function checkAvailability(int $productId, int $quantity): bool
    {
        $product = Product::find($productId);
        if (!$product) {
            return false;
        }

        return (int) $product->quantity >= $quantity;
    }

    public function getLowStockProducts(Shop $shop, int $threshold = 5): array
    {
        return BaseStockService::getLowStockProducts($shop, $threshold);
    }
}
