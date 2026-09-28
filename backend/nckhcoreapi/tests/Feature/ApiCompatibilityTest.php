<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class ApiCompatibilityTest extends TestCase
{
    protected function tearDown(): void
    {
        // Always reset admin lockout state after each test
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

    public function test_health_check_returns_ok(): void
    {
        $response = $this->getJson('/api/health');
        $response->assertStatus(200)
            ->assertJson(['status' => 'ok']);
    }

    public function test_admin_login_and_me(): void
    {
        $response = $this->postJson('/api/auth/login', [
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

        $meResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/auth/me');

        $meResponse->assertStatus(200)
            ->assertJson([
                'username' => 'admin',
                'role' => 'admin',
            ]);
    }

    public function test_login_lockout_after_failed_attempts(): void
    {
        // Attempt 1 -> 401
        $r1 = $this->postJson('/api/auth/login', [
            'username' => 'admin',
            'password' => 'wrongpass',
        ]);
        $r1->assertStatus(401)
            ->assertJsonStructure(['detail']);
        $this->assertStringContainsString('2 attempt(s) left', $r1->json('detail'));

        // Attempt 2 -> 401
        $r2 = $this->postJson('/api/auth/login', [
            'username' => 'admin',
            'password' => 'wrongpass',
        ]);
        $r2->assertStatus(401);
        $this->assertStringContainsString('1 attempt(s) left', $r2->json('detail'));

        // Attempt 3 -> Locks account (HTTP 429)
        $r3 = $this->postJson('/api/auth/login', [
            'username' => 'admin',
            'password' => 'wrongpass',
        ]);
        $r3->assertStatus(429);
        $this->assertStringContainsString('Too many failed attempts', $r3->json('detail'));
    }

    public function test_public_shop_and_products(): void
    {
        $shopResponse = $this->getJson('/api/shops/demo');
        $shopResponse->assertStatus(200)
            ->assertJson([
                'username' => 'demo',
                'shop_name' => 'Demo Fashion Store',
            ]);

        $shopId = $shopResponse->json('id');

        $productsResponse = $this->getJson('/api/products/public?shop_id=' . $shopId);
        $productsResponse->assertStatus(200);
        $products = $productsResponse->json();
        $this->assertIsArray($products);
        $this->assertGreaterThanOrEqual(1, count($products));
        $this->assertArrayHasKey('name', $products[0]);
        $this->assertArrayHasKey('price', $products[0]);

        $categoriesResponse = $this->getJson('/api/categories/public?shop_id=' . $shopId);
        $categoriesResponse->assertStatus(200);
        $this->assertIsArray($categoriesResponse->json());
        $this->assertGreaterThanOrEqual(1, count($categoriesResponse->json()));
    }

    public function test_shop_qr_code_generation(): void
    {
        $response = $this->get('/api/shops/demo/qr');
        $response->assertStatus(200);
        $this->assertEquals('image/png', $response->headers->get('Content-Type'));
        $this->assertNotEmpty($response->getContent());
    }

    public function test_customer_signup_and_signin(): void
    {
        $shop = Shop::where('username', 'demo')->first();
        $unique = time() . rand(100, 999);
        $username = 'cust_' . $unique;
        $email = 'testcust_' . $unique . '@example.com';
        $phone = '012' . rand(100000, 999999);

        $signup = $this->postJson('/api/customers/auth/signup', [
            'shop_id' => $shop->id,
            'username' => $username,
            'full_name' => 'Test Customer',
            'email' => $email,
            'password' => 'pass123456',
            'phone' => $phone,
        ]);

        $signup->assertStatus(200)
            ->assertJsonStructure([
                'access_token',
                'token_type',
                'customer' => ['id', 'email', 'name', 'username'],
            ]);

        $signin = $this->postJson('/api/customers/auth/signin', [
            'shop_id' => $shop->id,
            'identifier' => $username,
            'password' => 'pass123456',
        ]);

        $signin->assertStatus(200)
            ->assertJsonStructure([
                'access_token',
                'customer',
            ]);
    }

    public function test_order_creation_and_receipt(): void
    {
        $shop = Shop::where('username', 'demo')->first();
        $product = Product::where('shop_id', $shop->id)->first();

        // Sign up customer first to obtain a valid customer JWT
        $unique = time() . rand(100, 999);
        $signup = $this->postJson('/api/customers/auth/signup', [
            'shop_id' => $shop->id,
            'username' => 'buyer_' . $unique,
            'full_name' => 'John Buyer',
            'email' => 'buyer_' . $unique . '@example.com',
            'password' => 'buyer123',
            'phone' => '099' . rand(100000, 999999),
        ]);
        $customerToken = $signup->json('access_token');

        $orderData = [
            'shop_id' => $shop->id,
            'customer_name' => 'John Buyer',
            'customer_phone' => '099888777',
            'customer_address' => 'Street 2004, Phnom Penh',
            'delivery_address' => 'Street 2004, Phnom Penh',
            'payment_method' => 'cod',
            'items' => [
                [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'price' => $product->sale_price ?? $product->price,
                    'quantity' => 2,
                    'selected_attributes' => ['Size' => 'M'],
                ]
            ],
            'shipping_fee' => 1.50,
            'discount' => 0.0,
            'notes' => 'Please deliver in the afternoon',
        ];

        $createResponse = $this->withHeader('Authorization', 'Bearer ' . $customerToken)
            ->postJson('/api/orders', $orderData);

        $createResponse->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'order_number',
                'total',
                'items',
            ]);

        $orderNumber = $createResponse->json('order_number');
        $orderId = $createResponse->json('id');

        // Lookup by order number
        $lookupResponse = $this->getJson('/api/orders/' . $orderNumber);
        $lookupResponse->assertStatus(200)
            ->assertJson([
                'order_number' => $orderNumber,
                'customer_name' => 'John Buyer',
            ]);

        // PDF receipt generation
        $receiptResponse = $this->get('/api/orders/' . $orderId . '/receipt');
        $receiptResponse->assertStatus(200);
        $this->assertEquals('application/pdf', $receiptResponse->headers->get('Content-Type'));
        $this->assertFileExists($receiptResponse->getFile()->getPathname());
    }

    public function test_shop_reports_overview(): void
    {
        // Login as demo shop owner
        $loginResponse = $this->postJson('/api/auth/login', [
            'username' => 'demo',
            'password' => 'demo123',
        ]);
        $token = $loginResponse->json('access_token');
        $shopId = $loginResponse->json('user.shop_id');

        $reportsResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/reports/overview?shop_id=' . $shopId);

        $reportsResponse->assertStatus(200)
            ->assertJsonStructure([
                'today_orders',
                'today_revenue',
                'total_orders',
                'total_revenue',
                'pending_orders',
                'total_products',
                'total_customers',
                'total_categories',
                'recent_orders',
            ]);
    }

    public function test_categories_crud(): void
    {
        $loginResponse = $this->postJson('/api/auth/login', [
            'username' => 'demo',
            'password' => 'demo123',
        ]);
        $token = $loginResponse->json('access_token');
        $shopId = $loginResponse->json('user.shop_id');

        // Create
        $createCat = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/categories', [
                'shop_id' => $shopId,
                'name' => 'Footwear Test',
                'sort_order' => 10,
            ]);
        $createCat->assertStatus(200)
            ->assertJson([
                'name' => 'Footwear Test',
            ]);

        $catId = $createCat->json('id');

        // Update
        $updateCat = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/categories/' . $catId, [
                'name' => 'Footwear & Shoes',
            ]);
        $updateCat->assertStatus(200)
            ->assertJson(['name' => 'Footwear & Shoes']);

        // Delete
        $deleteCat = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/categories/' . $catId);
        $deleteCat->assertStatus(200)
            ->assertJson(['ok' => true]);
    }

    public function test_product_stock_adjustment(): void
    {
        $loginResponse = $this->postJson('/api/auth/login', [
            'username' => 'demo',
            'password' => 'demo123',
        ]);
        $token = $loginResponse->json('access_token');
        $shop = Shop::where('username', 'demo')->first();
        $product = Product::where('shop_id', $shop->id)->first();
        $initialQty = $product->quantity;

        $stockResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/products/' . $product->id . '/stock', [
                'quantity' => $initialQty + 10,
                'reason' => 'Restock shipment arrived',
            ]);

        $stockResponse->assertStatus(200)
            ->assertJson([
                'id' => $product->id,
                'quantity' => $initialQty + 10,
            ]);
    }

    public function test_pos_order_creation(): void
    {
        $loginResponse = $this->postJson('/api/auth/login', [
            'username' => 'demo',
            'password' => 'demo123',
        ]);
        $token = $loginResponse->json('access_token');
        $shop = Shop::where('username', 'demo')->first();
        $product = Product::where('shop_id', $shop->id)->first();

        $posResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/orders/pos', [
                'shop_id' => $shop->id,
                'payment_method' => 'cash',
                'customer_name' => 'Walk-in Customer',
                'items' => [
                    [
                        'product_id' => $product->id,
                        'name' => $product->name,
                        'price' => 15.00,
                        'quantity' => 1,
                    ]
                ],
                'discount' => 2.00,
                'notes' => 'Cash received',
            ]);

        $posResponse->assertStatus(200)
            ->assertJson([
                'payment_method' => 'cash',
                'payment_status' => 'paid',
                'order_status' => 'processing',
            ]);
    }

    public function test_plans_and_platform_settings(): void
    {
        $plansResponse = $this->getJson('/api/plans');
        $plansResponse->assertStatus(200);
        $this->assertIsArray($plansResponse->json());
        $this->assertGreaterThanOrEqual(1, count($plansResponse->json()));

        // Login as admin for platform settings
        $loginResponse = $this->postJson('/api/auth/login', [
            'username' => 'admin',
            'password' => 'admin123',
        ]);
        $adminToken = $loginResponse->json('access_token');

        // Update platform setting
        $saveSetting = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->postJson('/api/settings', [
                'key' => 'site_name',
                'value' => 'Mini Shop Cambodia',
            ]);
        $saveSetting->assertStatus(200);

        $settingsResponse = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->getJson('/api/settings/platform');
        $settingsResponse->assertStatus(200)
            ->assertJson([
                'site_name' => 'Mini Shop Cambodia',
                'default_admin' => 'admin',
            ]);
    }
}
