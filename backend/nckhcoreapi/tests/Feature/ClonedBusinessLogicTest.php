<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use App\Services\JwtService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class ClonedBusinessLogicTest extends TestCase
{
    protected string $adminToken;
    protected string $ownerToken;
    protected string $customerToken;
    protected Shop $shop;
    protected Customer $customer;

    protected function setUp(): void
    {
        parent::setUp();

        $jwt = app(JwtService::class);

        $admin = User::where('role', 'admin')->first();
        if (!$admin) {
            $admin = User::create([
                'username' => 'admin_test',
                'email' => 'admin_test@ministorekh.com',
                'password' => bcrypt('admin123'),
                'role' => 'admin',
                'status' => 'active',
            ]);
        }
        $this->adminToken = $jwt->createToken(['sub' => (string)$admin->id, 'role' => 'admin']);

        $this->shop = Shop::where('username', 'demo')->first();
        if (!$this->shop) {
            $this->shop = Shop::create([
                'username' => 'demo',
                'shop_name' => 'Demo Shop',
                'status' => 'active',
                'currency' => 'USD',
            ]);
        }
        $this->shop->telegram_settings = json_encode([
            'bot_token' => '123456:TEST_TOKEN',
            'chat_id' => '12345678',
            'enabled' => true,
            'mini_welcome_kh' => 'សូមស្វាគមន៍',
            'mini_welcome_en' => 'Welcome',
        ]);
        $this->shop->aba_settings = json_encode([
            'profile_id' => 'TEST_PROFILE',
            'secret_key' => 'TEST_SECRET',
        ]);
        $this->shop->save();

        $owner = User::where('shop_id', $this->shop->id)->first();
        if (!$owner) {
            $owner = User::create([
                'username' => 'owner_test',
                'email' => 'owner_test@ministorekh.com',
                'password' => bcrypt('owner123'),
                'role' => 'shop_owner',
                'shop_id' => $this->shop->id,
                'status' => 'active',
            ]);
        }
        $this->ownerToken = $jwt->createToken(['sub' => (string)$owner->id, 'role' => 'shop_owner', 'shop_id' => $this->shop->id]);

        $this->customer = Customer::where('shop_id', $this->shop->id)->first() ?: Customer::create([
            'shop_id' => $this->shop->id,
            'name' => 'Test Customer',
            'phone' => '012345678',
            'telegram' => '@testcust',
            'telegram_id' => 999888777,
        ]);

        $this->customerToken = $jwt->createToken([
            'sub' => (string)$this->customer->id,
            'role' => 'customer',
            'shop_id' => $this->shop->id,
            'tg_id' => $this->customer->telegram_id,
        ]);
    }

    public function test_platform_charts_endpoint(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/plans/charts');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'revenue_days',
                'revenue_series',
                'orders_by_status',
                'shops_by_plan',
                'top_shops',
                'resellers',
                'signup_months',
                'signup_series',
            ]);
    }

    public function test_reseller_customers_and_get_reseller(): void
    {
        $reseller = User::where('role', 'reseller')->first();
        if (!$reseller) {
            $reseller = User::create([
                'username' => 'reseller_demo',
                'email' => 'reseller@demo.com',
                'password' => bcrypt('secret123'),
                'role' => 'reseller',
                'referral_code' => 'DEMO10',
                'status' => 'active',
            ]);
        }

        // Get single reseller
        $r1 = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson("/api/plans/resellers/{$reseller->id}");
        $r1->assertStatus(200)
            ->assertJsonFragment(['id' => $reseller->id, 'role' => 'reseller'])
            ->assertJsonStructure(['id', 'username', 'referral_code', 'shops', 'customers']);

        // Get reseller customers
        $r2 = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson("/api/plans/resellers/{$reseller->id}/customers");
        $r2->assertStatus(200)
            ->assertJsonStructure([
                'reseller_id',
                'count',
                'customers',
            ]);
    }

    public function test_order_tracking_and_history_and_status(): void
    {
        $orderNum = 'ORD-TRACK-' . uniqid();
        $order = Order::create([
            'shop_id' => $this->shop->id,
            'customer_id' => $this->customer->id,
            'order_number' => $orderNum,
            'customer_name' => 'Track Customer',
            'customer_phone' => '099887766',
            'customer_telegram' => '@trackuser',
            'items_total' => 50,
            'total' => 50,
            'payment_status' => 'pending',
            'order_status' => 'pending',
        ]);

        // 1. Public Track
        $trackResp = $this->getJson('/api/orders/public/track?order_number=' . $orderNum);
        $trackResp->assertStatus(200)
            ->assertJsonFragment(['order_number' => $orderNum]);

        // 2. Public History
        $histResp = $this->postJson('/api/orders/public/history', [
            'shop_id' => $this->shop->id,
            'phone' => '099887766',
        ]);
        $histResp->assertStatus(200)
            ->assertJsonFragment(['shop_id' => $this->shop->id])
            ->assertJsonStructure(['shop_id', 'customer', 'count', 'orders']);

        // 3. Update Status
        $statusResp = $this->withHeader('Authorization', 'Bearer ' . $this->ownerToken)
            ->putJson("/api/orders/{$order->id}/status", [
                'order_status' => 'processing',
                'payment_status' => 'paid',
            ]);
        $statusResp->assertStatus(200)
            ->assertJsonFragment([
                'order_status' => 'processing',
                'payment_status' => 'paid',
            ]);

        // 4. Admin List All Orders
        $allResp = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/orders/all');
        $allResp->assertStatus(200)
            ->assertJsonIsArray();
    }

    public function test_customer_orders_and_search(): void
    {
        // 1. Customer my orders (authenticated customer)
        $resp = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->getJson('/api/customers/auth/orders');
        $resp->assertStatus(200)
            ->assertJsonStructure(['customer', 'count', 'orders']);

        // 2. Get customer with orders
        $cResp = $this->withHeader('Authorization', 'Bearer ' . $this->ownerToken)
            ->getJson("/api/customers/{$this->customer->id}");
        $cResp->assertStatus(200)
            ->assertJsonFragment(['id' => $this->customer->id])
            ->assertJsonStructure(['id', 'orders']);

        // 3. Customer search
        $sResp = $this->withHeader('Authorization', 'Bearer ' . $this->ownerToken)
            ->getJson("/api/customers?shop_id={$this->shop->id}&search=" . urlencode($this->customer->name));
        $sResp->assertStatus(200)
            ->assertJsonIsArray();
    }

    public function test_payment_aba_success_and_error_and_test(): void
    {
        $order = Order::create([
            'shop_id' => $this->shop->id,
            'order_number' => 'ORD-PAY-' . uniqid(),
            'customer_name' => 'Pay Customer',
            'total' => 25,
            'payment_status' => 'pending',
            'order_status' => 'pending',
        ]);

        // ABA Success
        $sResp = $this->getJson("/api/payments/aba/success?order_id={$order->id}");
        $sResp->assertStatus(200)
            ->assertJsonFragment(['ok' => true, 'order_id' => $order->id]);
        $this->assertEquals('paid', $order->fresh()->payment_status);

        // ABA Error
        $eResp = $this->getJson("/api/payments/aba/error?order_id={$order->id}");
        $eResp->assertStatus(200)
            ->assertJsonFragment(['ok' => false, 'order_id' => $order->id]);
        $this->assertEquals('failed', $order->fresh()->payment_status);

        // ABA Test
        $tResp = $this->withHeader('Authorization', 'Bearer ' . $this->ownerToken)
            ->postJson('/api/payments/aba/test', ['shop_id' => $this->shop->id]);
        $tResp->assertStatus(200)
            ->assertJsonStructure(['ok', 'profile_id', 'transaction_id', 'checkout_url']);
    }

    public function test_telegram_settings_and_activity(): void
    {
        // Telegram settings
        $tResp = $this->withHeader('Authorization', 'Bearer ' . $this->ownerToken)
            ->getJson("/api/telegram/settings?shop_id={$this->shop->id}");
        $tResp->assertStatus(200)
            ->assertJsonStructure(['bot_token', 'chat_id', 'enabled', 'profile_id', 'secret_key', 'linked_chats']);

        // Activity log
        ActivityLog::create([
            'shop_id' => $this->shop->id,
            'action' => 'test_action',
            'description' => 'Test activity log entry',
        ]);

        $aResp = $this->withHeader('Authorization', 'Bearer ' . $this->ownerToken)
            ->getJson("/api/activity?shop_id={$this->shop->id}");
        $aResp->assertStatus(200)
            ->assertJsonIsArray();
    }

    public function test_shop_mini_endpoint(): void
    {
        $resp = $this->getJson("/api/shops/{$this->shop->username}/mini");
        $resp->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'username',
                'mini_welcome_kh',
                'mini_welcome_en',
                'payment_configured',
                'telegram_login_enabled',
            ]);
    }

    public function test_backup_system_import_and_download(): void
    {
        $payload = [
            'type' => 'system',
            'shops' => [
                [
                    'username' => 'imported_shop_' . time(),
                    'shop_name' => 'Imported Shop',
                    'status' => 'active',
                ],
            ],
            'users' => [],
            'categories' => [],
            'products' => [],
            'orders' => [],
            'customers' => [],
            'settings' => [],
        ];

        $jsonFile = UploadedFile::fake()->createWithContent('system_backup.json', json_encode($payload));

        $resp = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->post('/api/backup/admin/import', [
                'file' => $jsonFile,
            ]);

        $resp->assertStatus(200)
            ->assertJsonFragment(['ok' => true]);
    }
}
