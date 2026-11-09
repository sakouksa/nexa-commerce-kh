<?php

namespace Tests\Feature;

use App\Actions\Orders\CreateOrderAction;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use App\Services\Auth\JwtService;
use App\Services\Inventory\StockService;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class CleanCodeAndSecurityReviewTest extends TestCase
{
    protected function tearDown(): void
    {
        Cache::flush();
        parent::tearDown();
    }

    public function test_cross_tenant_product_injection_is_prevented(): void
    {
        $shop1 = Shop::where('username', 'demo')->first() ?? Shop::create([
            'username' => 'shop1_'.time(),
            'shop_name' => 'Shop 1',
            'status' => 'active',
        ]);

        $shop2 = Shop::create([
            'username' => 'shop2_'.time(),
            'shop_name' => 'Shop 2',
            'status' => 'active',
        ]);

        $productShop2 = Product::create([
            'shop_id' => $shop2->id,
            'name' => 'Foreign Product',
            'price' => 50.0,
            'quantity' => 10,
            'status' => 'active',
        ]);

        $customer = Customer::create([
            'shop_id' => $shop1->id,
            'name' => 'Test Customer',
            'phone' => '012'.random_int(100000, 999999),
            'username' => 'cust_'.time(),
            'status' => 'active',
        ]);

        $action = app(CreateOrderAction::class);

        $this->expectException(HttpException::class);
        $this->expectExceptionMessage('does not belong to this shop');

        $action->execute([
            'shop_id' => $shop1->id,
            'customer_name' => 'Test Customer',
            'customer_phone' => $customer->phone,
            'items' => [
                [
                    'product_id' => $productShop2->id,
                    'quantity' => 1,
                    'price' => 50.0,
                ],
            ],
        ], $customer);
    }

    public function test_order_creation_preserves_shipping_fee_and_discount(): void
    {
        $shop = Shop::where('username', 'demo')->first() ?? Shop::first();

        $product = Product::create([
            'shop_id' => $shop->id,
            'name' => 'Product For Order Test',
            'price' => 20.0,
            'quantity' => 10,
            'status' => 'active',
        ]);

        $customer = Customer::create([
            'shop_id' => $shop->id,
            'name' => 'Discount Customer',
            'phone' => '098'.random_int(100000, 999999),
            'username' => 'disc_cust_'.time(),
            'status' => 'active',
        ]);

        $action = app(CreateOrderAction::class);
        $order = $action->execute([
            'shop_id' => $shop->id,
            'customer_name' => 'Discount Customer',
            'customer_phone' => $customer->phone,
            'delivery_address' => '123 Test St, Phnom Penh',
            'shipping_fee' => 2.50,
            'discount' => 5.00,
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                    'price' => 20.0,
                ],
            ],
        ], $customer);

        $this->assertEquals(40.00, (float) $order->items_total);
        $this->assertEquals(2.50, (float) $order->shipping_fee);
        $this->assertEquals(5.00, (float) $order->discount);
        $this->assertEquals(37.50, (float) $order->total); // 40 + 2.50 - 5.00 = 37.50
        $this->assertEquals('123 Test St, Phnom Penh', $order->customer_address);
    }

    public function test_stock_deduction_and_locking(): void
    {
        $shop = Shop::where('username', 'demo')->first() ?? Shop::first();

        $product = Product::create([
            'shop_id' => $shop->id,
            'name' => 'Stock Test Product',
            'price' => 15.0,
            'quantity' => 5,
            'status' => 'active',
        ]);

        $order = Order::create([
            'shop_id' => $shop->id,
            'order_number' => 'STK'.time(),
            'total' => 30.0,
            'items_total' => 30.0,
            'currency' => 'USD',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'price' => 15.0,
        ]);

        $summary = StockService::deductStockForOrder($order);

        $this->assertNotEmpty($summary);
        $this->assertEquals(3, $summary[$product->id]['remaining']);
        $product->refresh();
        $this->assertEquals(3, $product->quantity);
    }

    public function test_category_parent_must_belong_to_same_shop(): void
    {
        $admin = User::where('role', 'admin')->first();
        $jwt = app(JwtService::class)->createToken([
            'sub' => (string) $admin->id,
            'role' => $admin->role,
        ]);

        $shop1 = Shop::where('username', 'demo')->first() ?? Shop::first();
        $shop2 = Shop::create([
            'username' => 'shop_cat2_'.time(),
            'shop_name' => 'Cat Shop 2',
            'status' => 'active',
        ]);

        $catShop2 = Category::create([
            'shop_id' => $shop2->id,
            'name' => 'Shop 2 Parent Cat',
            'slug' => 'shop-2-parent',
        ]);

        // Attempt to create a category in shop 1 with parent belonging to shop 2
        $response = $this->withHeader('Authorization', 'Bearer '.$jwt)
            ->postJson('/api/categories', [
                'shop_id' => $shop1->id,
                'name' => 'Illicit Child Cat',
                'parent_id' => $catShop2->id,
            ]);

        $response->assertStatus(400);
        $this->assertStringContainsString('Invalid parent category', $response->json('detail'));
    }

    public function test_customer_cannot_view_another_customer_order_in_same_shop(): void
    {
        $shop = Shop::where('username', 'demo')->first() ?? Shop::first();

        $customerA = Customer::create([
            'shop_id' => $shop->id,
            'name' => 'Customer A',
            'phone' => '011'.random_int(100000, 999999),
            'username' => 'cust_a_'.time(),
            'status' => 'active',
        ]);

        $customerB = Customer::create([
            'shop_id' => $shop->id,
            'name' => 'Customer B',
            'phone' => '012'.random_int(100000, 999999),
            'username' => 'cust_b_'.time(),
            'status' => 'active',
        ]);

        $orderA = Order::create([
            'shop_id' => $shop->id,
            'customer_id' => $customerA->id,
            'customer_name' => $customerA->name,
            'customer_phone' => $customerA->phone,
            'order_number' => 'ORD-A-'.time(),
            'total' => 25.00,
            'items_total' => 25.00,
            'currency' => 'USD',
        ]);

        $jwt = app(JwtService::class);
        $tokenB = $jwt->createToken([
            'sub' => (string) $customerB->id,
            'role' => 'customer',
            'shop_id' => $shop->id,
        ]);

        // Customer B tries to view Customer A's order in the same shop
        $response = $this->withHeader('Authorization', 'Bearer '.$tokenB)
            ->getJson("/api/orders/{$orderA->id}");

        $response->assertStatus(403);
        $this->assertStringContainsString('Unauthorized access to this order', $response->json('detail'));
    }

    public function test_order_update_retains_both_order_status_and_payment_status(): void
    {
        $admin = User::where('role', 'admin')->first();
        $jwt = app(JwtService::class)->createToken([
            'sub' => (string) $admin->id,
            'role' => $admin->role,
        ]);

        $shop = Shop::where('username', 'demo')->first() ?? Shop::first();

        $order = Order::create([
            'shop_id' => $shop->id,
            'order_number' => 'ORD-UPD-'.time(),
            'order_status' => 'pending',
            'payment_status' => 'unpaid',
            'total' => 50.00,
            'items_total' => 50.00,
            'currency' => 'USD',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$jwt)
            ->putJson("/api/orders/{$order->id}", [
                'order_status' => 'confirmed',
                'payment_status' => 'paid',
            ]);

        $response->assertStatus(200);

        $refreshed = $order->fresh();
        $this->assertEquals('confirmed', $refreshed->order_status);
        $this->assertEquals('paid', $refreshed->payment_status);
    }

    public function test_non_admin_cannot_access_foreign_shop_settings(): void
    {
        $shop1 = Shop::where('username', 'demo')->first() ?? Shop::first();
        $shop2 = Shop::create([
            'username' => 'foreign_shop_'.time(),
            'shop_name' => 'Foreign Shop',
            'status' => 'active',
        ]);

        $userShop1 = User::create([
            'username' => 'merchant_'.time(),
            'email' => 'merchant_'.time().'@example.com',
            'password' => bcrypt('password123'),
            'role' => 'shop',
            'shop_id' => $shop1->id,
            'status' => 'active',
        ]);

        $jwt = app(JwtService::class)->createToken([
            'sub' => (string) $userShop1->id,
            'role' => $userShop1->role,
            'shop_id' => $shop1->id,
        ]);

        // Attempt to access Shop 2's settings
        $response = $this->withHeader('Authorization', 'Bearer '.$jwt)
            ->getJson("/api/settings?shop_id={$shop2->id}");

        $response->assertStatus(403);
    }
}
