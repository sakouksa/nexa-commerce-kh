<?php

namespace Tests\Unit\Actions\Telegram;

use App\Actions\Telegram\HandleStartAction;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class HandleStartActionTest extends TestCase
{
    public function test_handle_start_action_sends_shop_welcome(): void
    {
        Http::fake([
            'https://api.telegram.org/*' => Http::response(['ok' => true, 'result' => ['message_id' => 1]], 200),
        ]);

        $action = app(HandleStartAction::class);

        $shop = [
            'id' => 1,
            'shop_name' => 'Mini Mart KH',
            'username' => 'minimart',
            'bio' => 'Fresh groceries in Phnom Penh',
            'description' => 'Fast delivery to your door',
            'contact' => '+85512345678',
        ];

        $result = $action->execute(123456, null, $shop, 'mock_token');

        $this->assertTrue($result);
        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'sendMessage')
                && str_contains($request['text'], 'Mini Mart KH');
        });
    }

    public function test_handle_start_action_sends_platform_welcome_when_no_shop(): void
    {
        Http::fake([
            'https://api.telegram.org/*' => Http::response(['ok' => true, 'result' => ['message_id' => 2]], 200),
        ]);

        $action = app(HandleStartAction::class);
        $result = $action->execute(123456, null, null, 'mock_token');

        $this->assertTrue($result);
        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'sendMessage')
                && str_contains($request['text'], 'Nexa Commerce KH Bot');
        });
    }
}
