<?php

namespace Tests\Feature\Telegram;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WebhookTest extends TestCase
{
    public function test_webhook_accepts_valid_telegram_update(): void
    {
        Http::fake([
            'https://api.telegram.org/*' => Http::response(['ok' => true, 'result' => ['message_id' => 123]], 200),
            '*/api/shops/*' => Http::response(['id' => 1, 'shop_name' => 'Demo Shop', 'username' => 'demo'], 200),
        ]);

        $payload = [
            'update_id' => 10001,
            'message' => [
                'message_id' => 1,
                'from' => [
                    'id' => 999,
                    'is_bot' => false,
                    'first_name' => 'Test',
                ],
                'chat' => [
                    'id' => 999,
                    'type' => 'private',
                ],
                'date' => time(),
                'text' => '/start',
            ],
        ];

        $response = $this->postJson('/api/telegram/webhook/123456789:TEST_BOT_TOKEN', $payload);

        $response->assertStatus(200)
            ->assertJson(['ok' => true]);
    }

    public function test_webhook_returns_ok_on_empty_payload(): void
    {
        $response = $this->postJson('/api/telegram/webhook', []);

        $response->assertStatus(200)
            ->assertJson(['ok' => true]);
    }

    public function test_health_check_endpoint(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'ok',
                'service' => 'nckhtelegrambot',
            ]);
    }
}
