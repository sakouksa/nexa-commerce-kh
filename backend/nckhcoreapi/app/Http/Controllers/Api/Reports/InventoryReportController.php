<?php

namespace App\Http\Controllers\Api\Reports;

use App\Helpers\ShopHelper;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Shop;
use App\Services\StockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class InventoryReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id');
        if (!$shopId) {
            throw new HttpException(400, 'shop_id is required');
        }

        ShopHelper::requireShopAccess($shopId, $user);

        $shop = Shop::find($shopId);
        $products = Product::where('shop_id', $shopId)->get();
        $lowStock = StockService::getLowStockProducts($shop, 5);

        return response()->json([
            'total_items' => $products->count(),
            'total_quantity' => (int) $products->sum('quantity'),
            'out_of_stock_count' => $products->where('quantity', '<=', 0)->count(),
            'low_stock_count' => count($lowStock),
            'low_stock_items' => $lowStock,
        ]);
    }
}
