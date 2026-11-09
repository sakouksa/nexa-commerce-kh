<?php

namespace App\Actions\Inventory;

use App\Enums\StockMovementType;
use App\Exceptions\StockException;
use App\Models\Product;
use App\Models\Stock;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;

class AdjustStockAction
{
    public function execute(Product $product, int $quantity, string $reason = ''): Product
    {
        if ($quantity < 0) {
            throw StockException::negativeStockNotAllowed();
        }

        return DB::transaction(function () use ($product, $quantity, $reason) {
            $before = (int) $product->quantity;
            $product->quantity = $quantity;
            $product->save();

            Stock::updateOrCreate(
                ['shop_id' => $product->shop_id, 'product_id' => $product->id],
                ['quantity' => $quantity]
            );

            StockMovement::create([
                'shop_id' => $product->shop_id,
                'product_id' => $product->id,
                'type' => StockMovementType::ADJUSTMENT->value,
                'quantity' => abs($quantity - $before),
                'before_quantity' => $before,
                'after_quantity' => $quantity,
                'notes' => $reason,
            ]);

            return $product;
        });
    }
}
