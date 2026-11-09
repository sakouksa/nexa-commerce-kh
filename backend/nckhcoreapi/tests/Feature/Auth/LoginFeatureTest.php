<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

class LoginFeatureTest extends TestCase
{
    public function test_health_check_endpoint(): void
    {
        $response = $this->getJson('/api/health');
        $response->assertStatus(200)
            ->assertJson(['status' => 'ok']);
    }
}
