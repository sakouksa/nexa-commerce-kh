<?php

namespace App\Http\Controllers\Api\V1\Inventory;

use App\Actions\Inventory\AdjustStockAction;
use App\Helpers\ShopHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\AdjustStockRequest;
use App\Models\Product;
use App\Models\Shop;
use App\Models\Stock;
use App\Services\Inventory\StockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class StockController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id');
        if (! $shopId) {
            throw new HttpException(400, 'shop_id is required');
        }
        ShopHelper::requireShopAccess($shopId, $user);

        $stocks = Stock::with('product')->where('shop_id', $shopId)->get();

        return response()->json($stocks);
    }

    public function adjust(AdjustStockRequest $request, int $productId, AdjustStockAction $action): JsonResponse
    {
        $user = $request->user();
        $product = Product::find($productId);
        if (! $product) {
            throw new HttpException(404, 'Product not found');
        }
        ShopHelper::requireShopAccess($product->shop_id, $user);

        $updatedProduct = $action->execute(
            $product,
            (int) $request->input('quantity'),
            $request->input('reason', '')
        );

        return response()->json($updatedProduct->to_dict());
    }

    public function lowStock(Request $request): JsonResponse
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id');
        if (! $shopId) {
            throw new HttpException(400, 'shop_id is required');
        }
        ShopHelper::requireShopAccess($shopId, $user);

        $shop = Shop::find($shopId);
        $threshold = (int) $request->input('threshold', 5);
        $lowStocks = StockService::getLowStockProducts($shop, $threshold);

        return response()->json($lowStocks);
    }
}
