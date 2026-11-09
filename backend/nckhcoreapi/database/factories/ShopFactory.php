<?php

namespace Database\Factories;

use App\Models\Shop;
use Illuminate\Database\Eloquent\Factories\Factory;

class ShopFactory extends Factory
{
    protected $model = Shop::class;

    public function definition(): array
    {
        $name = fake()->company();
        return [
            'username' => fake()->unique()->slug(2),
            'shop_name' => $name,
            'currency' => 'USD',
            'status' => 'active',
            'description' => fake()->sentence(),
        ];
    }
}
