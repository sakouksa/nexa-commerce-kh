<?php

namespace Tests\Feature\Inventory;

use App\Actions\Inventory\AdjustStockAction;
use App\Models\Product;
use App\Models\Shop;
use Tests\TestCase;

class InventoryFeatureTest extends TestCase
{
    public function test_adjust_stock_action(): void
    {
        $shop = Shop::firstOrCreate(
            ['username' => 'testshop_inv'],
            ['shop_name' => 'Test Shop', 'currency' => 'USD']
        );

        $product = Product::create([
            'shop_id' => $shop->id,
            'name' => 'Stock Test Item',
            'price' => 10,
            'quantity' => 15,
        ]);

        $action = new AdjustStockAction();
        $updated = $action->execute($product, 25, 'Restocking');

        $this->assertEquals(25, $updated->quantity);
    }
}
