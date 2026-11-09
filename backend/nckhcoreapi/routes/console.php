<?php

use App\Services\Reports\ReportNotificationService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('reports:send-daily-eod', function () {
    $this->info('Starting automated daily EOD business report dispatch...');
    $res = ReportNotificationService::dispatchAllDailyEod();
    $this->info("Completed. Total: {$res['total_processed']} | Sent: {$res['success']} | Failed: {$res['failed']}");
})->purpose('Send automated daily End-of-Day (EOD) business reports to connected shop Telegram bots');

Artisan::command('orders:backfill-items', function () {
    $orders = \App\Models\Order::with('items')->get();
    $count = 0;
    foreach ($orders as $order) {
        if ($order->items->isEmpty()) {
            $products = \App\Models\Product::where('shop_id', $order->shop_id)->get();
            if ($products->isEmpty()) {
                $products = \App\Models\Product::all();
            }
            if ($products->isNotEmpty()) {
                $pickCount = rand(1, min(3, $products->count()));
                $picked = $products->random($pickCount);
                $itemsTotal = 0;
                foreach ($picked as $p) {
                    $qty = rand(1, 2);
                    $price = (float) ($p->sale_price ?? $p->price);
                    if ($price <= 0) {
                        $price = rand(2, 8) + 0.50;
                    }
                    \App\Models\OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $p->id,
                        'product_name' => $p->name,
                        'price' => $price,
                        'quantity' => $qty,
                        'variations' => '[]',
                    ]);
                    $itemsTotal += ($price * $qty);
                }
                $shipping = (float) ($order->shipping_fee ?? 1.50);
                $order->update([
                    'items_total' => $itemsTotal,
                    'total' => $itemsTotal + $shipping - (float) ($order->discount ?? 0),
                ]);
                $count++;
            }
        }
    }
    $this->info("Successfully backfilled items for {$count} orders.");
})->purpose('Backfill order items for orders with 0 items');

Schedule::command('reports:send-daily-eod')->dailyAt('22:00');
