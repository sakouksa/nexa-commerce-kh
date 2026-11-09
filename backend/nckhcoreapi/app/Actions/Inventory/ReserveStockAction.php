<?php

namespace App\Actions\Inventory;

use App\Enums\StockMovementType;
use App\Exceptions\StockException;
use App\Models\Product;
use App\Models\Stock;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;

class ReserveStockAction
{
    public function execute(Product $product, int $quantity, string $reference = ''): Stock
    {
        return DB::transaction(function () use ($product, $quantity, $reference) {
            $stock = Stock::firstOrCreate(
                ['shop_id' => $product->shop_id, 'product_id' => $product->id],
                ['quantity' => $product->quantity, 'reserved_quantity' => 0]
            );

            $available = $stock->quantity - $stock->reserved_quantity;
            if ($available < $quantity) {
                throw StockException::insufficientStock($product->name, $available, $quantity);
            }

            $before = $stock->reserved_quantity;
            $stock->reserved_quantity += $quantity;
            $stock->save();

            StockMovement::create([
                'shop_id' => $product->shop_id,
                'product_id' => $product->id,
                'type' => StockMovementType::RESERVE->value,
                'quantity' => $quantity,
                'before_quantity' => $before,
                'after_quantity' => $stock->reserved_quantity,
                'notes' => "Reserved for {$reference}",
            ]);

            return $stock;
        });
    }
}
