<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $shop = Shop::first();
        if (!$shop) {
            return;
        }

        $category = Category::where('shop_id', $shop->id)->first();

        Product::firstOrCreate(
            ['shop_id' => $shop->id, 'name' => 'Lok Lak Rice Bowl'],
            [
                'category_id' => $category?->id,
                'description' => 'Authentic Cambodian Beef Lok Lak served with steamed jasmine rice.',
                'price' => 4.50,
                'quantity' => 25,
                'status' => 'active',
                'featured' => true,
            ]
        );
    }
}
