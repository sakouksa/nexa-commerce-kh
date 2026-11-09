<?php

namespace App\Http\Controllers\Api\V1\Products;

use App\Helpers\ShopHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Products\StoreProductRequest;
use App\Http\Requests\Products\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ProductController extends Controller
{
    public function listPublic(Request $request)
    {
        $shopId = $request->input('shop_id');
        if (! $shopId) {
            throw new HttpException(400, 'shop_id is required');
        }

        $query = Product::with('category')->where('shop_id', $shopId)->where('status', 'active');

        if ($request->has('category_id') && $request->input('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->has('search') && trim($request->input('search'))) {
            $search = trim($request->input('search'));
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->boolean('featured_only')) {
            $query->where('featured', true);
        }

        $products = $query->get();

        $sort = $request->input('sort', 'newest');
        if ($sort === 'price_asc') {
            $products = $products->sortBy(fn ($p) => $p->sale_price !== null ? $p->sale_price : $p->price)->values();
        } elseif ($sort === 'price_desc') {
            $products = $products->sortByDesc(fn ($p) => $p->sale_price !== null ? $p->sale_price : $p->price)->values();
        } else {
            $products = $products->sortByDesc('created_at')->values();
        }

        return response()->json($products->map(fn ($p) => $p->to_dict())->toArray());
    }

    public function getPublic(int $productId)
    {
        $product = Product::with('category')->where('id', $productId)->where('status', 'active')->first();
        if (! $product) {
            throw new HttpException(404, 'Product not found');
        }

        return response()->json($product->to_dict());
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id');
        if (! $shopId) {
            throw new HttpException(400, 'shop_id is required');
        }

        ShopHelper::requireShopAccess($shopId, $user);

        $products = Product::with('category')->where('shop_id', $shopId)->orderBy('id', 'desc')->get();

        return response()->json($products->map(fn ($p) => $p->to_dict())->toArray());
    }

    public function show(Request $request, int $productId)
    {
        $user = $request->user();
        $product = Product::with('category')->find($productId);
        if (! $product) {
            throw new HttpException(404, 'Product not found');
        }

        ShopHelper::requireShopAccess($product->shop_id, $user);

        return response()->json($product->to_dict());
    }

    public function store(StoreProductRequest $request)
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id');
        ShopHelper::requireShopAccess($shopId, $user);

        if ($user->role !== 'admin') {
            $shop = Shop::find($shopId);
            if ($shop && $shop->max_products !== null) {
                $current = Product::where('shop_id', $shopId)->count();
                if ($current >= $shop->max_products) {
                    throw new HttpException(400, "Product limit reached ({$current}/{$shop->max_products}). Contact the platform admin to increase your limit.");
                }
            }
        }

        $categoryId = $request->input('category_id');
        if ($categoryId) {
            $cat = Category::where('id', $categoryId)->where('shop_id', $shopId)->first();
            if (! $cat) {
                throw new HttpException(400, 'Invalid category for this shop');
            }
        }

        $product = Product::create([
            'shop_id' => $shopId,
            'category_id' => $categoryId,
            'name' => $request->input('name'),
            'description' => $request->input('description', ''),
            'price' => (float) $request->input('price', 0),
            'sale_price' => $request->input('sale_price') !== null ? (float) $request->input('sale_price') : null,
            'quantity' => (int) $request->input('quantity', 0),
            'images' => is_array($request->input('images')) ? json_encode($request->input('images'), JSON_UNESCAPED_UNICODE) : ($request->input('images') ?? '[]'),
            'custom_attributes' => is_array($request->input('custom_attributes')) ? json_encode($request->input('custom_attributes'), JSON_UNESCAPED_UNICODE) : ($request->input('custom_attributes') ?? '[]'),
            'variations' => is_array($request->input('variations')) ? json_encode($request->input('variations'), JSON_UNESCAPED_UNICODE) : ($request->input('variations') ?? '[]'),
            'metadata_json' => is_array($request->input('metadata')) ? json_encode($request->input('metadata'), JSON_UNESCAPED_UNICODE) : ($request->input('metadata_json') ?? '{}'),
            'featured' => $request->boolean('featured', false),
            'status' => $request->input('status', 'active'),
        ]);

        ShopHelper::logActivity('create_product', "{$user->username} created product '{$product->name}'", $shopId, $user);

        return response()->json((new ProductResource($product))->resolve());
    }

    public function update(UpdateProductRequest $request, int $productId)
    {
        $user = $request->user();
        $product = Product::find($productId);
        if (! $product) {
            throw new HttpException(404, 'Product not found');
        }

        ShopHelper::requireShopAccess($product->shop_id, $user);

        if ($request->has('category_id')) {
            $categoryId = $request->input('category_id');
            if ($categoryId) {
                $cat = Category::where('id', $categoryId)->where('shop_id', $product->shop_id)->first();
                if (! $cat) {
                    throw new HttpException(400, 'Invalid category for this shop');
                }
            }
            $product->category_id = $categoryId;
        }

        $fields = ['name', 'description', 'price', 'sale_price', 'quantity', 'featured', 'status'];
        foreach ($fields as $f) {
            if ($request->has($f)) {
                $product->{$f} = $request->input($f);
            }
        }

        if ($request->has('images')) {
            $product->images = is_array($request->input('images')) ? json_encode($request->input('images'), JSON_UNESCAPED_UNICODE) : $request->input('images');
        }
        if ($request->has('custom_attributes')) {
            $product->custom_attributes = is_array($request->input('custom_attributes')) ? json_encode($request->input('custom_attributes'), JSON_UNESCAPED_UNICODE) : $request->input('custom_attributes');
        }
        if ($request->has('variations')) {
            $product->variations = is_array($request->input('variations')) ? json_encode($request->input('variations'), JSON_UNESCAPED_UNICODE) : $request->input('variations');
        }
        if ($request->has('metadata')) {
            $product->metadata_json = is_array($request->input('metadata')) ? json_encode($request->input('metadata'), JSON_UNESCAPED_UNICODE) : $request->input('metadata');
        }

        $product->save();
        ShopHelper::logActivity('update_product', "{$user->username} updated product '{$product->name}'", $product->shop_id, $user);

        return response()->json($product->to_dict());
    }

    public function updateStock(Request $request, int $productId)
    {
        $user = $request->user();
        $product = Product::find($productId);
        if (! $product) {
            throw new HttpException(404, 'Product not found');
        }

        ShopHelper::requireShopAccess($product->shop_id, $user);

        $qty = (int) $request->input('quantity', 0);
        $mode = $request->input('mode', 'set');

        if ($mode === 'add') {
            $product->quantity = (int) ($product->quantity ?? 0) + $qty;
        } else {
            $product->quantity = max(0, $qty);
        }

        $product->save();
        ShopHelper::logActivity('update_stock', "{$user->username} set stock of '{$product->name}' to {$product->quantity}", $product->shop_id, $user);

        return response()->json($product->to_dict());
    }

    public function destroy(Request $request, int $productId)
    {
        $user = $request->user();
        $product = Product::find($productId);
        if (! $product) {
            throw new HttpException(404, 'Product not found');
        }

        ShopHelper::requireShopAccess($product->shop_id, $user);
        $name = $product->name;
        $shopId = $product->shop_id;

        $product->delete();
        ShopHelper::logActivity('delete_product', "{$user->username} deleted product '{$name}'", $shopId, $user);

        return response()->json(['ok' => true]);
    }
}
