<?php

namespace App\Http\Controllers\Api\Inventory;

use App\Helpers\ShopHelper;
use App\Http\Controllers\Controller;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class StockMovementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id');
        if (!$shopId) {
            throw new HttpException(400, 'shop_id is required');
        }
        ShopHelper::requireShopAccess($shopId, $user);

        $query = StockMovement::with('product')->where('shop_id', $shopId);

        if ($request->has('product_id')) {
            $query->where('product_id', $request->input('product_id'));
        }

        $movements = $query->latest()->paginate((int) $request->input('per_page', 20));

        return response()->json($movements);
    }
}
