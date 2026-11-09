<?php

namespace App\Http\Controllers\Api\V1\Reports;

use App\Helpers\ShopHelper;
use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ProductReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id');
        if (! $shopId) {
            throw new HttpException(400, 'shop_id is required');
        }

        ShopHelper::requireShopAccess($shopId, $user);

        $items = OrderItem::whereHas('order', fn ($q) => $q->where('shop_id', $shopId))->get();
        $agg = [];
        foreach ($items as $it) {
            $name = $it->product_name ?: 'Product';
            if (! isset($agg[$name])) {
                $agg[$name] = ['name' => $name, 'units' => 0, 'revenue' => 0.0];
            }
            $agg[$name]['units'] += (int) $it->quantity;
            $agg[$name]['revenue'] += (float) ($it->price * $it->quantity);
        }

        usort($agg, fn ($a, $b) => $b['revenue'] <=> $a['revenue']);

        return response()->json($agg);
    }
}
