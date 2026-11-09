<?php

namespace App\Actions\Products;

use App\Models\Category;
use App\Models\Product;
use Symfony\Component\HttpKernel\Exception\HttpException;

class UpdateProductAction
{
    public function execute(Product $product, array $data): Product
    {
        if (array_key_exists('category_id', $data)) {
            $categoryId = $data['category_id'];
            if ($categoryId) {
                $cat = Category::where('id', $categoryId)->where('shop_id', $product->shop_id)->first();
                if (!$cat) {
                    throw new HttpException(400, 'Invalid category for this shop');
                }
            }
            $product->category_id = $categoryId;
        }

        $fields = ['name', 'description', 'price', 'sale_price', 'quantity', 'featured', 'status'];
        foreach ($fields as $f) {
            if (array_key_exists($f, $data)) {
                $product->{$f} = $data[$f];
            }
        }

        if (array_key_exists('images', $data)) {
            $product->images = is_array($data['images']) ? json_encode($data['images'], JSON_UNESCAPED_UNICODE) : ($data['images'] ?? '[]');
        }

        if (array_key_exists('custom_attributes', $data)) {
            $product->custom_attributes = is_array($data['custom_attributes']) ? json_encode($data['custom_attributes'], JSON_UNESCAPED_UNICODE) : ($data['custom_attributes'] ?? '[]');
        }

        if (array_key_exists('variations', $data)) {
            $product->variations = is_array($data['variations']) ? json_encode($data['variations'], JSON_UNESCAPED_UNICODE) : ($data['variations'] ?? '[]');
        }

        if (array_key_exists('metadata', $data)) {
            $product->metadata_json = is_array($data['metadata']) ? json_encode($data['metadata'], JSON_UNESCAPED_UNICODE) : ($data['metadata'] ?? '{}');
        }

        $product->save();

        return $product;
    }
}
