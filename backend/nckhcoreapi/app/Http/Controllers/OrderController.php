<?php

namespace App\Http\Controllers;

use App\Actions\Orders\CreateOrderAction;
use App\Actions\Orders\ProcessPosOrderAction;
use App\Actions\Orders\UpdateOrderStatusAction;
use App\Helpers\ShopHelper;
use App\Http\Requests\Orders\PosOrderRequest;
use App\Http\Requests\Orders\StoreOrderRequest;
use App\Http\Requests\Orders\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use App\Services\PdfReceiptService;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class OrderController extends Controller
{
    public static function generateOrderNumber(int $shopId): string
    {
        return app(OrderService::class)->generateOrderNumber($shopId);
    }

    public static function markPaid(Order $order, ?string $transactionId = null): bool
    {
        return app(OrderService::class)->markPaid($order, $transactionId);
    }

    public static function processFirstPayment(Order $order, ?array $stockSummary = null): void
    {
        app(OrderService::class)->processFirstPayment($order, $stockSummary);
    }

    public function store(StoreOrderRequest $request, CreateOrderAction $action)
    {
        $customer = $request->attributes->get('customer');
        if (! $customer) {
            throw new HttpException(401, 'Please login with Telegram to continue');
        }

        $order = $action->execute($request->validated(), $customer);

        return response()->json((new OrderResource($order))->resolve());
    }

    public function pos(PosOrderRequest $request, ProcessPosOrderAction $action)
    {
        $order = $action->execute($request->validated(), $request->user());

        return response()->json((new OrderResource($order))->resolve());
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id');
        if (! $shopId) {
            throw new HttpException(400, 'shop_id is required');
        }

        ShopHelper::requireShopAccess($shopId, $user);

        $query = Order::with(['items', 'shop'])->where('shop_id', $shopId);

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
            $query->where(function ($q) use ($s) {
                $q->where('order_number', 'like', "%{$s}%")
                    ->orWhere('customer_name', 'like', "%{$s}%")
                    ->orWhere('customer_phone', 'like', "%{$s}%");
            });
        }

        $orders = $query->orderBy('id', 'desc')->get();

        return response()->json($orders->map(fn ($o) => $o->to_dict())->toArray());
    }

    public function show(Request $request, string $idOrNumber)
    {
        $order = is_numeric($idOrNumber)
            ? Order::with(['items', 'shop'])->find((int) $idOrNumber)
            : Order::with(['items', 'shop'])->where('order_number', $idOrNumber)->first();

        if (! $order) {
            throw new HttpException(404, 'Order not found');
        }

        $user = $request->user();
        $customer = $request->attributes->get('customer');

        if ($user) {
            ShopHelper::requireShopAccess($order->shop_id, $user);
        } elseif ($customer) {
            if ((int) $order->customer_id !== (int) $customer->id || (int) $order->shop_id !== (int) $customer->shop_id) {
                throw new HttpException(403, 'Unauthorized access to this order');
            }
        } else {
            throw new HttpException(401, 'Authentication required');
        }

        return response()->json($order->to_dict());
    }

    public function update(Request $request, string $idOrNumber)
    {
        $user = $request->user();
        $order = is_numeric($idOrNumber)
            ? Order::with(['items', 'shop'])->find((int) $idOrNumber)
            : Order::with(['items', 'shop'])->where('order_number', $idOrNumber)->first();

        if (! $order) {
            throw new HttpException(404, 'Order not found');
        }

        ShopHelper::requireShopAccess($order->shop_id, $user);

        if ($request->has('payment_status')) {
            $newPay = $request->input('payment_status');
            if ($newPay === 'paid' && $order->payment_status !== 'paid') {
                self::markPaid($order);
                $order->refresh();
            } else {
                $order->payment_status = $newPay;
            }
        }

        if ($request->has('order_status')) {
            $order->order_status = $request->input('order_status');
        }

        $order->save();
        $order->load(['items', 'shop']);
        ShopHelper::logActivity('update_order', "Order #{$order->order_number} status updated to {$order->order_status}/{$order->payment_status}", $order->shop_id, $user);

        return response()->json($order->to_dict());
    }

    public function destroy(Request $request, string $idOrNumber)
    {
        $user = $request->user();
        $order = is_numeric($idOrNumber)
            ? Order::find((int) $idOrNumber)
            : Order::where('order_number', $idOrNumber)->first();

        if (! $order) {
            throw new HttpException(404, 'Order not found');
        }

        ShopHelper::requireShopAccess($order->shop_id, $user);
        $num = $order->order_number;
        $shopId = $order->shop_id;

        $order->delete();
        ShopHelper::logActivity('delete_order', "Order #{$num} deleted", $shopId, $user);

        return response()->json(['ok' => true]);
    }

    public function receipt(Request $request, int $orderId)
    {
        $order = Order::with(['items', 'shop'])->find($orderId);
        if (! $order) {
            throw new HttpException(404, 'Order not found');
        }
        if (! $order->shop) {
            throw new HttpException(404, 'Shop not found for this order');
        }

        $items = $order->items->map(fn ($i) => $i->to_dict())->toArray();
        $lang = $request->query('lang');
        $receiptPath = PdfReceiptService::generateReceipt($order, $order->shop, $items, $lang);
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
        if (! $orderNumber) {
            throw new HttpException(400, 'order_number is required');
        }

        $order = Order::with(['items', 'shop'])->where('order_number', $orderNumber)->first();
        if (! $order) {
            throw new HttpException(404, 'Order not found');
        }

        return response()->json($order->to_dict());
    }

    public function customerOrderHistory(Request $request)
    {
        $shopId = (int) $request->input('shop_id');
        if (! $shopId) {
            throw new HttpException(400, 'shop_id is required');
        }

        $phone = trim((string) $request->input('phone', ''));
        $telegram = trim((string) $request->input('telegram', ''));

        if (empty($phone) && empty($telegram)) {
            throw new HttpException(400, 'Please provide your phone number or Telegram username');
        }

        $q = Order::with(['items', 'shop'])->where('shop_id', $shopId);
        if (! empty($phone) && ! empty($telegram)) {
            $q->where(function ($sub) use ($phone, $telegram) {
                $sub->where('customer_phone', $phone)
                    ->orWhere('customer_telegram', $telegram);
            });
        } elseif (! empty($phone)) {
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
            'orders' => $orders->map(fn ($o) => $o->to_dict())->toArray(),
        ]);
    }

    public function listAllOrders(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            throw new HttpException(403, 'Admin privileges required');
        }

        $orders = Order::with(['items', 'shop'])->orderBy('id', 'desc')->limit(500)->get();

        return response()->json($orders->map(fn ($o) => $o->to_dict())->toArray());
    }

    public function updateStatus(UpdateOrderStatusRequest $request, string $idOrNumber, UpdateOrderStatusAction $action)
    {
        $user = $request->user();
        $order = is_numeric($idOrNumber)
            ? Order::with(['items', 'shop'])->find((int) $idOrNumber)
            : Order::with(['items', 'shop'])->where('order_number', $idOrNumber)->first();

        if (! $order) {
            throw new HttpException(404, 'Order not found');
        }

        $order = $action->execute($order->id, $request->validated(), $user);
        $order->load(['items', 'shop']);

        return response()->json((new OrderResource($order))->resolve());
    }
}
