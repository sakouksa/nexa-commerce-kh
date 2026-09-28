<?php

namespace App\Actions\Orders;

use App\Events\OrderCreated;
use App\Helpers\ShopHelper;
use App\Http\Controllers\OrderController;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CreateOrderAction
{
    public function execute(array $data, Customer $customer): Order
    {
        $shopId = (int) ($data['shop_id'] ?? 0);
        $shop = Shop::find($shopId);
        if (!$shop || $shop->status !== 'active') {
            throw new HttpException(404, 'Shop not found or unavailable');
        }

        $items = $data['items'] ?? [];
        if (empty($items)) {
            throw new HttpException(400, 'Order must contain at least one item');
        }

        if ((int) $customer->shop_id !== $shopId) {
            throw new HttpException(403, 'This account is not registered at this shop');
        }

        return DB::transaction(function () use ($data, $customer, $shop, $items, $shopId) {
            $customerTelegram = $data['customer_telegram'] ?? ($customer->telegram ?: "tg{$customer->telegram_id}");
            $shippingFee = (float) ($data['shipping_fee'] ?? 0);
            $discount = (float) ($data['discount'] ?? 0);

            $order = Order::create([
                'shop_id' => $shopId,
                'customer_id' => $customer->id,
                'order_number' => OrderController::generateOrderNumber($shopId),
                'customer_name' => $data['customer_name'] ?? $customer->name,
                'customer_email' => $data['customer_email'] ?? '',
                'customer_phone' => $data['customer_phone'] ?? $customer->phone,
                'customer_telegram' => $customerTelegram,
                'customer_address' => $data['customer_address'] ?? '',
                'customer_city' => $data['customer_city'] ?? '',
                'customer_country' => $data['customer_country'] ?? '',
                'customer_note' => $data['customer_note'] ?? ($data['notes'] ?? ''),
                'shipping_fee' => $shippingFee,
                'discount' => $discount,
                'currency' => $data['currency'] ?? ($shop->currency ?: 'USD'),
                'payment_method' => $data['payment_method'] ?? 'aba',
                'payment_status' => 'pending',
                'order_status' => 'pending',
            ]);

            $itemsTotal = 0.0;
            foreach ($items as $item) {
                $product = Product::find($item['product_id'] ?? null);
                $unitPrice = (float) ($item['price'] ?? 0);
                if ($product) {
                    $unitPrice = $product->sale_price !== null ? (float) $product->sale_price : (float) $product->price;
                }
                $qty = (int) ($item['quantity'] ?? 1);
                $itemsTotal += $unitPrice * $qty;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'] ?? null,
                    'product_name' => $item['name'] ?? ($product ? $product->name : 'Product'),
                    'price' => $unitPrice,
                    'quantity' => $qty,
                    'variations' => isset($item['variations']) ? json_encode($item['variations'], JSON_UNESCAPED_UNICODE) : '{}',
                ]);
            }

            $order->items_total = round($itemsTotal, 2);
            $order->total = round($itemsTotal + $shippingFee - $discount, 2);
            $order->save();

            // Update customer record
            if (!empty($data['customer_phone'])) $customer->phone = $data['customer_phone'];
            if (!empty($data['customer_address'])) $customer->address = $data['customer_address'];
            if (!empty($data['customer_city'])) $customer->city = $data['customer_city'];
            if (!empty($data['customer_country'])) $customer->country = $data['customer_country'];
            if (!empty($data['customer_email'])) $customer->email = $data['customer_email'];
            $customer->save();

            ShopHelper::logActivity('create_order', "New order #{$order->order_number} ({$order->total} {$order->currency})", $shopId);

            event(new OrderCreated($order));

            return $order->load('items');
        });
    }
}
