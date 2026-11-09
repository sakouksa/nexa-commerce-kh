<?php

namespace App\Actions\Products;

use App\Models\Product;

class DeleteProductAction
{
    public function execute(Product $product): bool
    {
        return (bool) $product->delete();
    }
}
