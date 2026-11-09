<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Shop;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DemoOrdersSeeder extends Seeder
{
    public function run(): void
    {
        $shops = Shop::all();
        if ($shops->isEmpty()) {
            return;
        }

        $names = [
            'Sokha Chan', 'Bopha Keo', 'Vannak Heng', 'Rathana Seng',
            'Chanthou Lim', 'Visal Chea', 'Dara Sam', 'Phalla Pich',
            'Sovann Khem', 'Kanha Ou'
        ];

        $customers = [];
        foreach ($names as $idx => $name) {
            $parts = explode(' ', $name);
            $shop = $shops[$idx % $shops->count()];
            $c = Customer::firstOrCreate(
                ['email' => strtolower($parts[0]) . ($idx + 1) . '@gmail.com'],
                [
                    'shop_id' => $shop->id,
                    'first_name' => $parts[0],
                    'last_name' => $parts[1] ?? '',
                    'name' => $name,
                    'username' => strtolower($parts[0]) . ($idx + 1),
                    'phone' => '012' . rand(100000, 999999),
                    'city' => 'Phnom Penh',
                    'country' => 'Cambodia',
                ]
            );
            $customers[] = $c;
        }

        if (Order::count() < 10) {
            $statuses = ['paid', 'paid', 'paid', 'paid', 'pending', 'paid'];
            $orderStatuses = ['completed', 'completed', 'delivered', 'processing', 'pending', 'completed'];

            for ($i = 0; $i < 30; $i++) {
                $shop = $shops[$i % $shops->count()];
                $customer = $customers[$i % count($customers)];
                $payStatus = $statuses[$i % count($statuses)];
                $orderStatus = $orderStatuses[$i % count($orderStatuses)];
                $daysAgo = 29 - $i;
                $createdAt = Carbon::now()->subDays($daysAgo)->subHours(rand(1, 10));
                $itemsTotal = rand(15, 80) + 0.50;
                $shipping = 1.50;
                $total = $itemsTotal + $shipping;

                $order = Order::create([
                    'shop_id' => $shop->id,
                    'customer_id' => $customer->id,
                    'order_number' => 'ORD-' . strtoupper(substr(md5(uniqid()), 0, 8)),
                    'customer_name' => $customer->name,
                    'customer_email' => $customer->email,
                    'customer_phone' => $customer->phone,
                    'customer_city' => 'Phnom Penh',
                    'customer_country' => 'Cambodia',
                    'items_total' => $itemsTotal,
                    'shipping_fee' => $shipping,
                    'discount' => 0,
                    'total' => $total,
                    'currency' => 'USD',
                    'payment_method' => ($i % 2 == 0) ? 'aba_khqr' : 'cod',
                    'payment_status' => $payStatus,
                    'order_status' => $orderStatus,
                    'paid_at' => ($payStatus === 'paid') ? $createdAt : null,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);

                $products = Product::where('shop_id', $shop->id)->get();
                if ($products->isNotEmpty()) {
                    $picked = $products->random(rand(1, min(3, $products->count())));
                    $actualItemsTotal = 0;
                    foreach ($picked as $p) {
                        $qty = rand(1, 2);
                        $pPrice = (float) ($p->sale_price ?? $p->price);
                        if ($pPrice <= 0) $pPrice = 3.50;
                        OrderItem::create([
                            'order_id' => $order->id,
                            'product_id' => $p->id,
                            'product_name' => $p->name,
                            'price' => $pPrice,
                            'quantity' => $qty,
                            'variations' => '[]',
                        ]);
                        $actualItemsTotal += ($pPrice * $qty);
                    }
                    $order->update([
                        'items_total' => $actualItemsTotal,
                        'total' => $actualItemsTotal + $shipping,
                    ]);
                }
            }
        }
    }
}

