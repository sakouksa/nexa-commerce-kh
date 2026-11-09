<?php

namespace App\Actions\Inventory;

use App\Enums\StockMovementType;
use App\Models\Product;
use App\Models\Stock;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;

class ReleaseStockAction
{
    public function execute(Product $product, int $quantity, string $reference = ''): Stock
    {
        return DB::transaction(function () use ($product, $quantity, $reference) {
            $stock = Stock::firstOrCreate(
                ['shop_id' => $product->shop_id, 'product_id' => $product->id],
                ['quantity' => $product->quantity, 'reserved_quantity' => 0]
            );

            $releaseQty = min($stock->reserved_quantity, $quantity);
            $before = $stock->reserved_quantity;
            $stock->reserved_quantity = max(0, $stock->reserved_quantity - $releaseQty);
            $stock->save();

            StockMovement::create([
                'shop_id' => $product->shop_id,
                'product_id' => $product->id,
                'type' => StockMovementType::RELEASE->value,
                'quantity' => $releaseQty,
                'before_quantity' => $before,
                'after_quantity' => $stock->reserved_quantity,
                'notes' => "Released for {$reference}",
            ]);

            return $stock;
        });
    }
}
