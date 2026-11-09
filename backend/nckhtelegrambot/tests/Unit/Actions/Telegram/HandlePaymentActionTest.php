<?php

namespace Tests\Unit\Actions\Telegram;

use App\Actions\Telegram\HandlePaymentAction;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class HandlePaymentActionTest extends TestCase
{
    public function test_handle_payment_displays_payment_info(): void
    {
        Http::fake([
            'https://api.telegram.org/*' => Http::response(['ok' => true, 'result' => ['message_id' => 6]], 200),
        ]);

        $action = app(HandlePaymentAction::class);
        $result = $action->execute(123456, null, ['shop_name' => 'Demo Mart'], 'mock_token');

        $this->assertTrue($result);
        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'sendMessage')
                && str_contains($request['text'], 'ABA Pay (KHQR)');
        });
    }

    public function test_handle_payment_links_chat_with_profile_and_secret(): void
    {
        Http::fake([
            '*/api/bot-service/link*' => Http::response([
                'ok' => true,
                'shop_name' => 'Boutique Store',
            ], 200),
            'https://api.telegram.org/*' => Http::response(['ok' => true, 'result' => ['message_id' => 7]], 200),
        ]);

        $action = app(HandlePaymentAction::class);
        $result = $action->execute(123456, 'PID123 SEC999', null, 'mock_token');

        $this->assertTrue($result);
        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'sendMessage')
                && str_contains($request['text'], 'ភ្ជាប់ជោគជ័យ');
        });
    }
}
