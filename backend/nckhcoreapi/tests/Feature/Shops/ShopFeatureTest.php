<?php

namespace Tests\Feature\Shops;

use Tests\TestCase;

class ShopFeatureTest extends TestCase
{
    public function test_public_shop_not_found(): void
    {
        $response = $this->getJson('/api/shops/nonexistent_shop_12345');
        $response->assertStatus(404);
    }
}
