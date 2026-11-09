<?php

namespace Tests\Unit\Services\CoreApi;

use App\Services\CoreApi\CoreApiService;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CoreApiServiceTest extends TestCase
{
    public function test_get_shop_by_username(): void
    {
        Http::fake([
            '*/api/shops/demo' => Http::response([
                'id' => 1,
                'shop_name' => 'Demo Shop',
                'username' => 'demo',
            ], 200),
        ]);

        $service = app(CoreApiService::class);
        $shop = $service->getShop('demo');

        $this->assertNotNull($shop);
        $this->assertEquals('Demo Shop', $shop['shop_name']);
    }

    public function test_track_order_successful(): void
    {
        Http::fake([
            '*/api/orders/public/track*' => Http::response([
                'order_number' => 'ORD-999',
                'status' => 'paid',
                'total_amount' => 20.00,
            ], 200),
        ]);

        $service = app(CoreApiService::class);
        $order = $service->trackOrder('ORD-999');

        $this->assertNotNull($order);
        $this->assertEquals('ORD-999', $order['order_number']);
        $this->assertEquals('paid', $order['status']);
    }

    public function test_link_payment_chat(): void
    {
        Http::fake([
            '*/api/bot-service/link*' => Http::response([
                'ok' => true,
                'shop_username' => 'demo',
            ], 200),
        ]);

        $service = app(CoreApiService::class);
        $res = $service->linkPaymentChat('PID_001', 'SEC_001', 88888);

        $this->assertTrue($res['ok']);
        $this->assertEquals('demo', $res['shop_username']);
    }
}
