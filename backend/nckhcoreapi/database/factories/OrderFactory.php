<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Shop;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'shop_id' => Shop::factory(),
            'order_number' => 'ORD-' . strtoupper(fake()->bothify('##??####')),
            'customer_name' => fake()->name(),
            'customer_phone' => fake()->phoneNumber(),
            'total' => fake()->randomFloat(2, 5, 200),
            'currency' => 'USD',
            'order_status' => 'pending',
            'payment_status' => 'pending',
        ];
    }
}
