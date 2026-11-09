<?php

namespace Tests\Unit\Actions\Telegram;

use App\Actions\Telegram\HandleOrderAction;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class HandleOrderActionTest extends TestCase
{
    public function test_handle_order_prompts_when_order_number_missing(): void
    {
        Http::fake([
            'https://api.telegram.org/*' => Http::response(['ok' => true, 'result' => ['message_id' => 4]], 200),
        ]);

        $action = app(HandleOrderAction::class);
        $result = $action->execute(123456, null, null, 'mock_token');

        $this->assertTrue($result);
        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'sendMessage')
                && str_contains($request['text'], 'Track Your Order');
        });
    }

    public function test_handle_order_displays_order_details(): void
    {
        Http::fake([
            '*/api/orders/public/track*' => Http::response([
                'order_number' => 'ORD-1001',
                'customer_name' => 'Sokha Meng',
                'status' => 'paid',
                'total_amount' => 15.50,
                'items' => [
                    ['product_name' => 'Organic Honey', 'quantity' => 1, 'price' => 15.50],
                ],
            ], 200),
            'https://api.telegram.org/*' => Http::response(['ok' => true, 'result' => ['message_id' => 5]], 200),
        ]);

        $action = app(HandleOrderAction::class);
        $result = $action->execute(123456, 'ORD-1001', null, 'mock_token');

        $this->assertTrue($result);
        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'sendMessage')
                && str_contains($request['text'], 'ORD-1001')
                && str_contains($request['text'], 'Sokha Meng');
        });
    }
}
