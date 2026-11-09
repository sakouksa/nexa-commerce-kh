<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Shop;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $shop = Shop::first();
        if (!$shop) {
            return;
        }

        $categories = ['Food', 'Beverages', 'Dessert', 'Snacks'];
        foreach ($categories as $index => $cat) {
            Category::firstOrCreate(
                ['shop_id' => $shop->id, 'name' => $cat],
                [
                    'slug' => strtolower($cat),
                    'sort_order' => $index,
                ]
            );
        }
    }
}
