<?php

namespace App\Http\Controllers;

use App\Helpers\ShopHelper;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\StockService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ReportController extends Controller
{
    public function sales(Request $request)
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id');
        if (!$shopId) {
            throw new HttpException(400, 'shop_id is required');
        }

        ShopHelper::requireShopAccess($shopId, $user);

        $period = $request->input('period', 'daily'); // daily | weekly | monthly
        $days = (int) $request->input('days', 30);
        $since = Carbon::now()->subDays($days);

        $orders = Order::where('shop_id', $shopId)
            ->where('created_at', '>=', $since)
            ->where('payment_status', 'paid')
            ->get();

        $buckets = [];
        foreach ($orders as $o) {
            $d = $o->created_at;
            if ($period === 'weekly') {
                $key = $d->format('Y') . '-W' . $d->format('W');
            } elseif ($period === 'monthly') {
                $key = $d->format('Y-m');
            } else {
                $key = $d->format('Y-m-d');
            }

            if (!isset($buckets[$key])) {
                $buckets[$key] = ['date' => $key, 'orders' => 0, 'revenue' => 0.0];
            }
            $buckets[$key]['orders'] += 1;
            $buckets[$key]['revenue'] += (float) $o->total;
        }

        ksort($buckets);
        $data = array_values($buckets);
        $totals = [
            'orders' => array_sum(array_column($data, 'orders')),
            'revenue' => round(array_sum(array_column($data, 'revenue')), 2),
        ];

        return response()->json([
            'period' => $period,
            'days' => $days,
            'totals' => $totals,
            'data' => $data,
        ]);
    }

    public function overview(Request $request)
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id');
        if (!$shopId) {
            throw new HttpException(400, 'shop_id is required');
        }

        ShopHelper::requireShopAccess($shopId, $user);

        $today = Carbon::today();
        $orders = Order::where('shop_id', $shopId)->get();
        $todayOrders = $orders->filter(fn($o) => $o->created_at && $o->created_at >= $today);
        $paidOrders = $orders->filter(fn($o) => $o->payment_status === 'paid');

        return response()->json([
            'today_orders' => $todayOrders->count(),
            'today_revenue' => round($todayOrders->where('payment_status', 'paid')->sum('total'), 2),
            'total_orders' => $orders->count(),
            'total_revenue' => round($paidOrders->sum('total'), 2),
            'pending_orders' => $orders->where('order_status', 'pending')->count(),
            'total_products' => Product::where('shop_id', $shopId)->count(),
            'total_customers' => Customer::where('shop_id', $shopId)->count(),
            'total_categories' => Category::where('shop_id', $shopId)->count(),
            'recent_orders' => $orders->sortByDesc('id')->take(10)->map(fn($o) => $o->to_dict())->values()->toArray(),
        ]);
    }

    public function products(Request $request)
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id');
        if (!$shopId) {
            throw new HttpException(400, 'shop_id is required');
        }

        ShopHelper::requireShopAccess($shopId, $user);

        $items = OrderItem::whereHas('order', fn($q) => $q->where('shop_id', $shopId))->get();
        $agg = [];
        foreach ($items as $it) {
            $name = $it->product_name ?: 'Product';
            if (!isset($agg[$name])) {
                $agg[$name] = ['name' => $name, 'units' => 0, 'revenue' => 0.0];
            }
            $agg[$name]['units'] += (int) $it->quantity;
            $agg[$name]['revenue'] += (float) ($it->price * $it->quantity);
        }

        usort($agg, fn($a, $b) => $b['revenue'] <=> $a['revenue']);
        return response()->json($agg);
    }

    public function customers(Request $request)
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id');
        if (!$shopId) {
            throw new HttpException(400, 'shop_id is required');
        }

        ShopHelper::requireShopAccess($shopId, $user);

        $customers = Customer::where('shop_id', $shopId)->get();
        $out = [];
        foreach ($customers as $c) {
            $orders = Order::where('shop_id', $shopId)->where('customer_phone', $c->phone)->get();
            $paidTotal = $orders->where('payment_status', 'paid')->sum('total');
            $out[] = array_merge($c->to_dict(), [
                'order_count' => $orders->count(),
                'total_spent' => round($paidTotal, 2),
            ]);
        }

        return response()->json($out);
    }

    public function stock(Request $request)
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id');
        if (!$shopId) {
            throw new HttpException(400, 'shop_id is required');
        }

        ShopHelper::requireShopAccess($shopId, $user);

        $low = (int) $request->input('low', StockService::DEFAULT_LOW);
        $high = (int) $request->input('high', StockService::DEFAULT_HIGH);

        return response()->json(StockService::getStockReport($shopId, $low, $high));
    }

    public function salesExport(Request $request)
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id');
        if (!$shopId) {
            throw new HttpException(400, 'shop_id is required');
        }

        ShopHelper::requireShopAccess($shopId, $user);

        $days = (int) $request->input('days', 30);
        $since = Carbon::now()->subDays($days);

        $orders = Order::where('shop_id', $shopId)
            ->where('created_at', '>=', $since)
            ->orderBy('id', 'desc')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"sales_report_{$shopId}.csv\"",
        ];

        $callback = function() use ($orders) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Order #', 'Date', 'Customer', 'Phone', 'Items Total', 'Shipping', 'Discount', 'Grand Total', 'Currency', 'Payment Status']);
            foreach ($orders as $o) {
                fputcsv($file, [
                    $o->order_number,
                    $o->created_at ? $o->created_at->format('Y-m-d H:i') : '',
                    $o->customer_name,
                    $o->customer_phone,
                    $o->items_total,
                    $o->shipping_fee,
                    $o->discount,
                    $o->total,
                    $o->currency,
                    $o->payment_status,
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
