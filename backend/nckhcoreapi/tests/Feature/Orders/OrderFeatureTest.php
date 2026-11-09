<?php

namespace Tests\Feature\Orders;

use Tests\TestCase;

class OrderFeatureTest extends TestCase
{
    public function test_order_creation_requires_auth(): void
    {
        $response = $this->postJson('/api/orders', []);
        $response->assertStatus(401);
    }
}
