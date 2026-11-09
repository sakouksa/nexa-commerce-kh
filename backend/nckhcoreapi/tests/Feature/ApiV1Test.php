<?php

namespace Tests\Feature;

use App\Models\Shop;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class ApiV1Test extends TestCase
{
    protected function tearDown(): void
    {
        $admin = User::where('username', 'admin')->first();
        if ($admin) {
            $admin->login_failed_count = 0;
            $admin->login_locked_until = null;
            $admin->login_locked_count = 0;
            $admin->save();
        }
        Cache::flush();
        parent::tearDown();
    }

    public function test_v1_health_check(): void
    {
        $response = $this->getJson('/api/v1/health');
        $response->assertStatus(200)
            ->assertJson(['status' => 'ok']);
    }

    public function test_v1_admin_login_and_me(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'username' => 'admin',
            'password' => 'admin123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'access_token',
                'token_type',
                'user' => ['id', 'username', 'email', 'role', 'status'],
            ]);

        $token = $response->json('access_token');

        $meResponse = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/auth/me');

        $meResponse->assertStatus(200)
            ->assertJson([
                'username' => 'admin',
                'role' => 'admin',
            ]);
    }

    public function test_v1_public_categories_and_products(): void
    {
        $shop = Shop::first();
        $shopId = $shop ? $shop->id : 1;

        $response = $this->getJson('/api/v1/categories/public?shop_id='.$shopId);
        $response->assertStatus(200);

        $response = $this->getJson('/api/v1/products/public?shop_id='.$shopId);
        $response->assertStatus(200);
    }

    public function test_v1_plans_list(): void
    {
        $response = $this->getJson('/api/v1/plans');
        $response->assertStatus(200);
    }
}
