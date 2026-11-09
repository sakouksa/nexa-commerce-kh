<?php

namespace Tests\Unit\Services\Telegram;

use App\Services\Telegram\TelegramApiService;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TelegramApiServiceTest extends TestCase
{
    public function test_send_message_successful(): void
    {
        Http::fake([
            'https://api.telegram.org/botmock_token/sendMessage' => Http::response([
                'ok' => true,
                'result' => ['message_id' => 101, 'text' => 'Hello!'],
            ], 200),
        ]);

        $service = app(TelegramApiService::class);
        $res = $service->sendMessage(12345, 'Hello!', null, 'HTML', 'mock_token');

        $this->assertIsArray($res);
        $this->assertTrue($res['ok']);
    }

    public function test_get_updates_returns_list(): void
    {
        Http::fake([
            'https://api.telegram.org/botmock_token/getUpdates' => Http::response([
                'ok' => true,
                'result' => [
                    ['update_id' => 1, 'message' => ['text' => '/start']],
                ],
            ], 200),
        ]);

        $service = app(TelegramApiService::class);
        $updates = $service->getUpdates(0, 100, 0, ['message'], 'mock_token');

        $this->assertCount(1, $updates);
        $this->assertEquals(1, $updates[0]['update_id']);
    }

    public function test_delete_webhook(): void
    {
        Http::fake([
            'https://api.telegram.org/botmock_token/deleteWebhook' => Http::response([
                'ok' => true,
                'result' => true,
            ], 200),
        ]);

        $service = app(TelegramApiService::class);
        $ok = $service->deleteWebhook(false, 'mock_token');

        $this->assertTrue($ok);
    }
}
