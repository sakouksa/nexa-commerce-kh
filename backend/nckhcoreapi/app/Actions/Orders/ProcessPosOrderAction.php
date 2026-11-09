<?php

namespace App\Actions\Orders;

use App\Events\OrderCreated;
use App\Helpers\ShopHelper;
use App\Http\Controllers\OrderController;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use App\Services\StockService;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ProcessPosOrderAction
{
    public function execute(array $data, User $user): Order
    {
        $shopId = (int) ($data['shop_id'] ?? 0);
        ShopHelper::requireShopAccess($shopId, $user);

        $shop = Shop::find($shopId);
        if (! $shop) {
            throw new HttpException(404, 'Shop not found');
        }

        $items = $data['items'] ?? [];
        if (empty($items)) {
            throw new HttpException(400, 'items required');
        }

        return DB::transaction(function () use ($data, $user, $shop, $items) {
            $method = $data['payment_method'] ?? 'cash';
            $discount = (float) ($data['discount'] ?? 0);

            $order = Order::create([
                'shop_id' => $shop->id,
                'order_number' => 'POS'.$shop->id.'-'.time().'-'.random_int(100, 999),
                'customer_name' => $data['customer_name'] ?? 'Walk-in Customer',
                'customer_phone' => $data['customer_phone'] ?? '',
                'customer_note' => $data['notes'] ?? 'POS Sale',
                'shipping_fee' => 0,
                'discount' => $discount,
                'currency' => $shop->currency ?: 'USD',
                'payment_method' => $method,
                'payment_status' => $method === 'cash' ? 'paid' : 'pending',
                'order_status' => $method === 'cash' ? 'processing' : 'pending',
                'paid_at' => $method === 'cash' ? now() : null,
            ]);

            $itemsTotal = 0.0;
            foreach ($items as $item) {
                $productId = $item['product_id'] ?? null;
                $product = $productId ? Product::find($productId) : null;
                if ($product && (int) $product->shop_id !== (int) $shop->id) {
                    throw new HttpException(400, "Product #{$product->id} does not belong to this shop");
                }

                $unitPrice = (float) ($item['price'] ?? 0);
                if ($product && ! isset($item['price'])) {
                    $unitPrice = $product->sale_price !== null ? (float) $product->sale_price : (float) $product->price;
                }
                $qty = (int) ($item['quantity'] ?? 1);

                if ($product) {
                    $avail = (int) ($product->quantity ?? 0);
                    if ($qty > $avail) {
                        throw new HttpException(400, "ទំនិញ '{$product->name}' ក្នុងស្តុកនៅសល់តែ {$avail} ប៉ុណ្ណោះ មិនគ្រប់សម្រាប់ការលក់ឡើយ (Insufficient stock: only {$avail} available)");
                    }
                }

                $itemsTotal += $unitPrice * $qty;

                $variationPayload = $item['variations'] ?? ($item['selected_attributes'] ?? null);
                $variationJson = is_array($variationPayload)
                    ? json_encode($variationPayload, JSON_UNESCAPED_UNICODE)
                    : (is_string($variationPayload) ? $variationPayload : '{}');

                $productName = $item['product_name'] ?? ($item['name'] ?? ($product ? $product->name : 'Product'));

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $productId,
                    'product_name' => $productName,
                    'price' => $unitPrice,
                    'quantity' => $qty,
                    'variations' => $variationJson,
                ]);
            }

            $order->items_total = round($itemsTotal, 2);
            $order->total = round($itemsTotal - $discount, 2);
            $order->save();

            if ($method === 'cash') {
                $stockSummary = StockService::deductStockForOrder($order);
                OrderController::processFirstPayment($order, $stockSummary);
                event(new OrderCreated($order, $stockSummary));
            }

            ShopHelper::logActivity('pos_order', "POS sale created #{$order->order_number} ({$order->total} {$order->currency}) [{$method}]", $shop->id, $user);

            return $order->load(['items', 'shop']);
        });
    }
}
