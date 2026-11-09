<?php

namespace Tests\Feature\Products;

use Tests\TestCase;

class ProductFeatureTest extends TestCase
{
    public function test_public_products_requires_shop_id(): void
    {
        $response = $this->getJson('/api/products/public');
        $response->assertStatus(400);
    }
}
