<?php

namespace App\Http\Controllers\Api\V1\Reports;

use App\Helpers\ShopHelper;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class SalesReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id');
        if (! $shopId) {
            throw new HttpException(400, 'shop_id is required');
        }

        ShopHelper::requireShopAccess($shopId, $user);

        $period = $request->input('period', 'daily');
        $days = (int) $request->input('days', 30);
        $since = Carbon::now()->subDays($days);

        $orders = Order::where('shop_id', $shopId)
            ->where('created_at', '>=', $since)
            ->where('payment_status', 'paid')
            ->get();

        $buckets = [];
        foreach ($orders as $o) {
            $d = $o->created_at;
            $key = match ($period) {
                'weekly' => $d->format('Y').'-W'.$d->format('W'),
                'monthly' => $d->format('Y-m'),
                default => $d->format('Y-m-d'),
            };

            if (! isset($buckets[$key])) {
                $buckets[$key] = ['date' => $key, 'orders' => 0, 'revenue' => 0.0];
            }
            $buckets[$key]['orders'] += 1;
            $buckets[$key]['revenue'] += (float) $o->total;
        }

        ksort($buckets);
        $data = array_values($buckets);

        return response()->json([
            'period' => $period,
            'days' => $days,
            'totals' => [
                'orders' => array_sum(array_column($data, 'orders')),
                'revenue' => round(array_sum(array_column($data, 'revenue')), 2),
            ],
            'data' => $data,
        ]);
    }
}
