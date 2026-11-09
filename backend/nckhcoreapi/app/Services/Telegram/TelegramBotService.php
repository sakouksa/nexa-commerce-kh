<?php

namespace App\Services\Telegram;

use App\Models\Shop;

class TelegramBotService
{
    public function sendMessage(string $botToken, string $chatId, string $text): bool
    {
        return TelegramService::sendTelegramMessage($botToken, $chatId, $text);
    }

    public function notifyShop(Shop $shop, string $text): bool
    {
        return TelegramService::sendShopNotification($shop, $text);
    }

    public function getWebhookInfo(string $botToken): array
    {
        return TelegramService::getWebhookInfo($botToken);
    }

    public function setWebhook(string $botToken, string $url): array
    {
        return TelegramService::setWebhook($botToken, $url);
    }
}
