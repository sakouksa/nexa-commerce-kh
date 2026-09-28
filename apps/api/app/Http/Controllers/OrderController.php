<?php

namespace App\Http\Controllers;

use App\Helpers\ShopHelper;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Shop;
use App\Services\PdfReceiptService;
use App\Services\StockService;
use App\Services\TelegramService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class OrderController extends Controller
{
    public static function generateOrderNumber(int $shopId): string
    {
        return 'ORD' . $shopId . '-' . time() . '-' . random_int(100, 999);
    }

    public static function markPaid(Order $order, ?string $transactionId = null): bool
    {
        if ($order->payment_status === 'paid') {
            return false;
        }

        $tx = $transactionId ?: $order->transaction_id;
        $affected = DB::table('orders')
            ->where('id', $order->id)
            ->where('payment_status', '!=', 'paid')
            ->update([
                'payment_status' => 'paid',
                'paid_at' => now(),
                'transaction_id' => $tx,
                'updated_at' => now(),
            ]);

        if ($affected === 0) {
            $order->refresh();
            return false;
        }

        $order->refresh();
        $stockSummary = StockService::deductStockForOrder($order);
        self::processFirstPayment($order, $stockSummary);

        return true;
    }

    public static function processFirstPayment(Order $order, ?array $stockSummary = null): void
    {
        $shop = $order->shop;
        if (!$shop) return;

        try {
            $items = $order->items->map(fn($i) => $i->to_dict())->toArray();
            $order->receipt_url = PdfReceiptService::generateReceipt($order, $shop, $items);
            $order->save();
        } catch (\Exception $e) {
            // receipt generation fallback
        }

        $tg = $shop->telegram_dict();
        if (!empty($tg['enabled'])) {
            TelegramService::notifyShopPaymentSuccessFull($shop, $order, $stockSummary);
        }

        try {
            StockService::sendLowStockAlerts($shop);
        } catch (\Exception $e) {
            //
        }

        ShopHelper::logActivity('payment_success', "Payment confirmed for #{$order->order_number} ({$order->total} {$order->currency})", $order->shop_id);
    }

    public function store(\App\Http\Requests\Orders\StoreOrderRequest $request, \App\Actions\Orders\CreateOrderAction $action)
    {
        $customer = $request->attributes->get('customer');
        if (!$customer) {
            throw new HttpException(401, 'Please login with Telegram to continue');
        }

        $order = $action->execute($request->validated(), $customer);
        return response()->json((new \App\Http\Resources\OrderResource($order))->resolve());
    }

    public function pos(\App\Http\Requests\Orders\PosOrderRequest $request, \App\Actions\Orders\ProcessPosOrderAction $action)
    {
        $order = $action->execute($request->validated(), $request->user());
        return response()->json((new \App\Http\Resources\OrderResource($order))->resolve());
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id');
        if (!$shopId) {
            throw new HttpException(400, 'shop_id is required');
        }

        ShopHelper::requireShopAccess($shopId, $user);

        $query = Order::with('items')->where('shop_id', $shopId);

        if ($request->has('status') && $request->input('status')) {
            $query->where('order_status', $request->input('status'));
        }
        if ($request->has('payment_status') && $request->input('payment_status')) {
            $query->where('payment_status', $request->input('payment_status'));
        }
        if ($request->has('date_from') && $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }
        if ($request->has('date_to') && $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }
        if ($request->has('search') && trim($request->input('search'))) {
            $s = trim($request->input('search'));
            $query->where(function($q) use ($s) {
                $q->where('order_number', 'like', "%{$s}%")
                  ->orWhere('customer_name', 'like', "%{$s}%")
                  ->orWhere('customer_phone', 'like', "%{$s}%");
            });
        }

        $orders = $query->orderBy('id', 'desc')->get();
        return response()->json($orders->map(fn($o) => $o->to_dict())->toArray());
    }

    public function show(Request $request, string $idOrNumber)
    {
        $order = is_numeric($idOrNumber)
            ? Order::with('items')->find((int) $idOrNumber)
            : Order::with('items')->where('order_number', $idOrNumber)->first();

        if (!$order) {
            throw new HttpException(404, 'Order not found');
        }

        return response()->json($order->to_dict());
    }

    public function update(Request $request, string $idOrNumber)
    {
        $user = $request->user();
        $order = is_numeric($idOrNumber)
            ? Order::with('items')->find((int) $idOrNumber)
            : Order::with('items')->where('order_number', $idOrNumber)->first();

        if (!$order) {
            throw new HttpException(404, 'Order not found');
        }

        ShopHelper::requireShopAccess($order->shop_id, $user);

        if ($request->has('order_status')) {
            $order->order_status = $request->input('order_status');
        }
        if ($request->has('payment_status')) {
            $newPay = $request->input('payment_status');
            if ($newPay === 'paid' && $order->payment_status !== 'paid') {
                self::markPaid($order);
            } else {
                $order->payment_status = $newPay;
            }
        }

        $order->save();
        ShopHelper::logActivity('update_order', "Order #{$order->order_number} status updated to {$order->order_status}/{$order->payment_status}", $order->shop_id, $user);

        return response()->json($order->to_dict());
    }

    public function destroy(Request $request, string $idOrNumber)
    {
        $user = $request->user();
        $order = is_numeric($idOrNumber)
            ? Order::find((int) $idOrNumber)
            : Order::where('order_number', $idOrNumber)->first();

        if (!$order) {
            throw new HttpException(404, 'Order not found');
        }

        ShopHelper::requireShopAccess($order->shop_id, $user);
        $num = $order->order_number;
        $shopId = $order->shop_id;

        $order->delete();
        ShopHelper::logActivity('delete_order', "Order #{$num} deleted", $shopId, $user);

        return response()->json(['ok' => true]);
    }

    public function receipt(int $orderId)
    {
        $order = Order::with('items')->find($orderId);
        if (!$order) {
            throw new HttpException(404, 'Order not found');
        }

        $items = $order->items->map(fn($i) => $i->to_dict())->toArray();
        $receiptPath = PdfReceiptService::generateReceipt($order, $order->shop, $items);
        $fullPath = public_path(ltrim($receiptPath, '/'));

        return response()->file($fullPath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "inline; filename=\"receipt_{$order->order_number}.pdf\"",
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
        ]);
    }

    public function trackOrder(Request $request)
    {
        $orderNumber = $request->query('order_number');
        if (!$orderNumber) {
            throw new HttpException(400, 'order_number is required');
        }

        $order = Order::with('items')->where('order_number', $orderNumber)->first();
        if (!$order) {
            throw new HttpException(404, 'Order not found');
        }

        return response()->json($order->to_dict());
    }

    public function customerOrderHistory(Request $request)
    {
        $shopId = (int) $request->input('shop_id');
        $phone = trim((string) $request->input('phone', ''));
        $telegram = trim((string) $request->input('telegram', ''));

        if (empty($phone) && empty($telegram)) {
            throw new HttpException(400, 'Please provide your phone number or Telegram username');
        }

        $q = Order::with('items')->where('shop_id', $shopId);
        if (!empty($phone) && !empty($telegram)) {
            $q->where(function ($sub) use ($phone, $telegram) {
                $sub->where('customer_phone', $phone)
                    ->orWhere('customer_telegram', $telegram);
            });
        } elseif (!empty($phone)) {
            $q->where('customer_phone', $phone);
        } else {
            $q->where('customer_telegram', $telegram);
        }

        $orders = $q->orderBy('id', 'desc')->get();

        return response()->json([
            'shop_id' => $shopId,
            'customer' => [
                'phone' => $phone,
                'telegram' => $telegram,
            ],
            'count' => $orders->count(),
            'orders' => $orders->map(fn($o) => $o->to_dict())->toArray(),
        ]);
    }

    public function listAllOrders(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            throw new HttpException(403, 'Admin privileges required');
        }

        $orders = Order::with('items')->orderBy('id', 'desc')->limit(500)->get();
        return response()->json($orders->map(fn($o) => $o->to_dict())->toArray());
    }

    public function updateStatus(\App\Http\Requests\Orders\UpdateOrderStatusRequest $request, string $idOrNumber, \App\Actions\Orders\UpdateOrderStatusAction $action)
    {
        $user = $request->user();
        $order = is_numeric($idOrNumber)
            ? Order::with('items')->find((int) $idOrNumber)
            : Order::with('items')->where('order_number', $idOrNumber)->first();

        if (!$order) {
            throw new HttpException(404, 'Order not found');
        }

        $order = $action->execute($order->id, $request->validated(), $user);
        return response()->json((new \App\Http\Resources\OrderResource($order))->resolve());
    }
}

