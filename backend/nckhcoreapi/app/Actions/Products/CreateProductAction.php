<?php

namespace App\Actions\Products;

use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CreateProductAction
{
    public function execute(array $data, ?User $user = null): Product
    {
        $shopId = (int) ($data['shop_id'] ?? 0);
        $shop = Shop::find($shopId);
        if (!$shop) {
            throw new HttpException(404, 'Shop not found');
        }

        if ($user && $user->role !== 'admin' && $shop->max_products !== null) {
            $current = Product::where('shop_id', $shopId)->count();
            if ($current >= $shop->max_products) {
                throw new HttpException(400, "Product limit reached ({$current}/{$shop->max_products}).");
            }
        }

        $categoryId = $data['category_id'] ?? null;
        if ($categoryId) {
            $cat = Category::where('id', $categoryId)->where('shop_id', $shopId)->first();
            if (!$cat) {
                throw new HttpException(400, 'Invalid category for this shop');
            }
        }

        return Product::create([
            'shop_id' => $shopId,
            'category_id' => $categoryId,
            'name' => $data['name'],
            'description' => $data['description'] ?? '',
            'price' => (float) ($data['price'] ?? 0),
            'sale_price' => isset($data['sale_price']) && $data['sale_price'] !== null ? (float) $data['sale_price'] : null,
            'quantity' => (int) ($data['quantity'] ?? 0),
            'images' => is_array($data['images'] ?? null) ? json_encode($data['images'], JSON_UNESCAPED_UNICODE) : ($data['images'] ?? '[]'),
            'custom_attributes' => is_array($data['custom_attributes'] ?? null) ? json_encode($data['custom_attributes'], JSON_UNESCAPED_UNICODE) : ($data['custom_attributes'] ?? '[]'),
            'variations' => is_array($data['variations'] ?? null) ? json_encode($data['variations'], JSON_UNESCAPED_UNICODE) : ($data['variations'] ?? '[]'),
            'metadata_json' => is_array($data['metadata'] ?? null) ? json_encode($data['metadata'], JSON_UNESCAPED_UNICODE) : ($data['metadata_json'] ?? '{}'),
            'featured' => (bool) ($data['featured'] ?? false),
            'status' => $data['status'] ?? 'active',
        ]);
    }
}
