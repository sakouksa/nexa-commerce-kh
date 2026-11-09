<?php

namespace Tests\Feature\Payments;

use Tests\TestCase;

class PaymentFeatureTest extends TestCase
{
    public function test_aba_status_requires_shop_id(): void
    {
        $response = $this->getJson('/api/payments/aba/status');
        $response->assertStatus(400);
    }
}
