<?php

namespace Database\Seeders;

use App\Models\Shop;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ShopSeeder extends Seeder
{
    public function run(): void
    {
        $shop = Shop::firstOrCreate(
            ['username' => 'fooddemo'],
            [
                'shop_name' => 'Food & Drink Cambodia',
                'currency' => 'USD',
                'status' => 'active',
                'description' => 'Delicious Khmer food and drinks delivery.',
            ]
        );

        User::firstOrCreate(
            ['username' => 'fooddemo_owner'],
            [
                'email' => 'foodowner@ministore.kh',
                'password' => Hash::make('password123'),
                'role' => 'shop_owner',
                'shop_id' => $shop->id,
                'status' => 'active',
            ]
        );
    }
}
