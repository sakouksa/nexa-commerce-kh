<?php

namespace App\Http\Controllers;

use App\Helpers\ShopHelper;
use App\Http\Requests\Categories\StoreCategoryRequest;
use App\Http\Requests\Categories\UpdateCategoryRequest;
use App\Models\Category;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CategoryController extends Controller
{
    public function listPublic(Request $request)
    {
        $shopId = $request->input('shop_id');
        if (! $shopId) {
            throw new HttpException(400, 'shop_id is required');
        }

        $cats = Category::withCount(['products' => fn ($q) => $q->where('status', 'active')])
            ->where('shop_id', $shopId)
            ->orderBy('sort_order')
            ->get();
        $out = [];
        foreach ($cats as $c) {
            $d = $c->to_dict();
            $d['product_count'] = (int) $c->products_count;
            $out[] = $d;
        }

        return response()->json($out);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id');
        if (! $shopId) {
            throw new HttpException(400, 'shop_id is required');
        }

        ShopHelper::requireShopAccess($shopId, $user);

        $cats = Category::withCount('products')
            ->where('shop_id', $shopId)
            ->orderBy('sort_order')
            ->get();
        $out = [];
        foreach ($cats as $c) {
            $d = $c->to_dict();
            $d['product_count'] = (int) $c->products_count;
            $out[] = $d;
        }

        return response()->json($out);
    }

    public function store(StoreCategoryRequest $request)
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id');
        ShopHelper::requireShopAccess($shopId, $user);

        if ($user->role !== 'admin') {
            $shop = Shop::find($shopId);
            if ($shop && $shop->max_categories !== null) {
                $current = Category::where('shop_id', $shopId)->count();
                if ($current >= $shop->max_categories) {
                    throw new HttpException(400, "Category limit reached ({$current}/{$shop->max_categories}). Contact the platform admin to increase your limit.");
                }
            }
        }

        $parentId = $request->input('parent_id');
        if ($parentId) {
            $parentCat = Category::where('id', $parentId)->where('shop_id', $shopId)->first();
            if (! $parentCat) {
                throw new HttpException(400, 'Invalid parent category for this shop');
            }
        }

        $name = $request->input('name');
        $slug = $request->input('slug') ?: Str::slug($name);

        $cat = Category::create([
            'shop_id' => $shopId,
            'name' => $name,
            'slug' => $slug,
            'parent_id' => $parentId,
            'image' => $request->input('image', ''),
            'sort_order' => (int) $request->input('sort_order', 0),
        ]);

        ShopHelper::logActivity('create_category', "{$user->username} created category '{$name}'", $shopId, $user);

        return response()->json($cat->to_dict());
    }

    public function update(UpdateCategoryRequest $request, int $categoryId)
    {
        $user = $request->user();
        $cat = Category::find($categoryId);
        if (! $cat) {
            throw new HttpException(404, 'Category not found');
        }

        ShopHelper::requireShopAccess($cat->shop_id, $user);

        if ($request->has('name')) {
            $cat->name = $request->input('name');
        }
        if ($request->has('slug')) {
            $cat->slug = $request->input('slug');
        } elseif ($request->has('name')) {
            $cat->slug = Str::slug($request->input('name'));
        }
        if ($request->has('parent_id')) {
            $parentId = $request->input('parent_id');
            if ($parentId) {
                if ((int) $parentId === (int) $cat->id) {
                    throw new HttpException(400, 'Category cannot be its own parent');
                }
                $parentCat = Category::where('id', $parentId)->where('shop_id', $cat->shop_id)->first();
                if (! $parentCat) {
                    throw new HttpException(400, 'Invalid parent category for this shop');
                }
            }
            $cat->parent_id = $parentId;
        }
        if ($request->has('image')) {
            $cat->image = $request->input('image');
        }
        if ($request->has('sort_order')) {
            $cat->sort_order = (int) $request->input('sort_order');
        }

        $cat->save();
        ShopHelper::logActivity('update_category', "{$user->username} updated category '{$cat->name}'", $cat->shop_id, $user);

        return response()->json($cat->to_dict());
    }

    public function destroy(Request $request, int $categoryId)
    {
        $user = $request->user();
        $cat = Category::find($categoryId);
        if (! $cat) {
            throw new HttpException(404, 'Category not found');
        }

        ShopHelper::requireShopAccess($cat->shop_id, $user);
        $name = $cat->name;
        $shopId = $cat->shop_id;

        $cat->delete();
        ShopHelper::logActivity('delete_category', "{$user->username} deleted category '{$name}'", $shopId, $user);

        return response()->json(['ok' => true]);
    }
}
