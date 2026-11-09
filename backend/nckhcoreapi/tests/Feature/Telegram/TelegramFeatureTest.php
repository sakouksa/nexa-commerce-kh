<?php

namespace Tests\Feature\Telegram;

use Tests\TestCase;

class TelegramFeatureTest extends TestCase
{
    public function test_telegram_empty_webhook(): void
    {
        $response = $this->postJson('/api/telegram/webhook/fake_token_123', []);
        $response->assertStatus(200);
    }
}
