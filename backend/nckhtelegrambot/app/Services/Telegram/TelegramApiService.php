<?php

namespace App\Services\Telegram;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class TelegramApiService
{
    protected string $apiUrl;
    protected string $defaultToken;
    protected int $timeout;

    public function __construct()
    {
        $this->apiUrl = rtrim(config('telegram.api_url', 'https://api.telegram.org'), '/');
        $this->defaultToken = config('telegram.bot_token', '');
        $this->timeout = (int) config('telegram.request_timeout', 30);
    }

    /**
     * Resolve bot token (passed explicitly or fallback to default).
     */
    public function resolveToken(?string $botToken = null): string
    {
        $token = trim($botToken ?? $this->defaultToken);

        if (empty($token)) {
            Log::warning('TelegramApiService: No bot token provided or configured.');
        }

        return $token;
    }

    /**
     * Send text message to a Telegram chat.
     */
    public function sendMessage(
        string|int $chatId,
        string $text,
        ?array $replyMarkup = null,
        string $parseMode = 'HTML',
        ?string $botToken = null
    ): array|bool {
        $token = $this->resolveToken($botToken);
        if (empty($token)) {
            return false;
        }

        $payload = [
            'chat_id' => $chatId,
            'text' => $text,
            'disable_web_page_preview' => true,
        ];

        if ($parseMode) {
            $payload['parse_mode'] = $parseMode;
        }

        if ($replyMarkup) {
            $payload['reply_markup'] = $replyMarkup;
        }

        // Try with requested parse mode
        $response = $this->post($token, 'sendMessage', $payload);

        if ($response && ($response['ok'] ?? false)) {
            return $response;
        }

        // Fallback: If HTML formatting failed, send plain text
        if ($parseMode === 'HTML') {
            unset($payload['parse_mode']);
            $payload['text'] = strip_tags($text);
            $retry = $this->post($token, 'sendMessage', $payload);
            if ($retry && ($retry['ok'] ?? false)) {
                return $retry;
            }
        }

        return false;
    }

    /**
     * Send photo with caption to a Telegram chat.
     */
    public function sendPhoto(
        string|int $chatId,
        string $photo,
        ?string $caption = null,
        ?array $replyMarkup = null,
        string $parseMode = 'HTML',
        ?string $botToken = null
    ): array|bool {
        $token = $this->resolveToken($botToken);
        if (empty($token) || empty($photo)) {
            return false;
        }

        $payload = [
            'chat_id' => $chatId,
            'photo' => $photo,
        ];

        if ($caption !== null && $caption !== '') {
            $payload['caption'] = mb_substr($caption, 0, 1024);
            if ($parseMode) {
                $payload['parse_mode'] = $parseMode;
            }
        }

        if ($replyMarkup) {
            $payload['reply_markup'] = $replyMarkup;
        }

        $response = $this->post($token, 'sendPhoto', $payload);

        if ($response && ($response['ok'] ?? false)) {
            return $response;
        }

        // Fallback: retry caption without HTML parse_mode if needed
        if ($parseMode === 'HTML' && isset($payload['caption'])) {
            unset($payload['parse_mode']);
            $payload['caption'] = strip_tags($caption);
            $retry = $this->post($token, 'sendPhoto', $payload);
            if ($retry && ($retry['ok'] ?? false)) {
                return $retry;
            }
        }

        return false;
    }

    /**
     * Fetch updates via long-polling (getUpdates).
     */
    public function getUpdates(
        int $offset = 0,
        int $limit = 100,
        int $timeout = 0,
        array $allowedUpdates = ['message', 'callback_query', 'my_chat_member'],
        ?string $botToken = null
    ): array {
        $token = $this->resolveToken($botToken);
        if (empty($token)) {
            return [];
        }

        $params = [
            'offset' => $offset,
            'limit' => $limit,
            'timeout' => $timeout,
            'allowed_updates' => $allowedUpdates,
        ];

        $response = $this->post($token, 'getUpdates', $params, $timeout + 10);

        if ($response && ($response['ok'] ?? false)) {
            return $response['result'] ?? [];
        }

        return [];
    }

    /**
     * Set webhook for Telegram bot.
     */
    public function setWebhook(
        string $url,
        ?string $secretToken = null,
        array $allowedUpdates = ['message', 'callback_query', 'my_chat_member'],
        ?string $botToken = null
    ): bool {
        $token = $this->resolveToken($botToken);
        if (empty($token)) {
            return false;
        }

        $payload = [
            'url' => $url,
            'allowed_updates' => $allowedUpdates,
        ];

        if ($secretToken) {
            $payload['secret_token'] = $secretToken;
        }

        $response = $this->post($token, 'setWebhook', $payload);

        return (bool) ($response['ok'] ?? false);
    }

    /**
     * Delete webhook to enable polling.
     */
    public function deleteWebhook(bool $dropPendingUpdates = false, ?string $botToken = null): bool
    {
        $token = $this->resolveToken($botToken);
        if (empty($token)) {
            return false;
        }

        $response = $this->post($token, 'deleteWebhook', [
            'drop_pending_updates' => $dropPendingUpdates,
        ]);

        return (bool) ($response['ok'] ?? false);
    }

    /**
     * Acknowledge callback query.
     */
    public function answerCallbackQuery(
        string $callbackQueryId,
        ?string $text = null,
        bool $showAlert = false,
        ?string $botToken = null
    ): bool {
        $token = $this->resolveToken($botToken);
        if (empty($token)) {
            return false;
        }

        $payload = [
            'callback_query_id' => $callbackQueryId,
            'show_alert' => $showAlert,
        ];

        if ($text) {
            $payload['text'] = $text;
        }

        $response = $this->post($token, 'answerCallbackQuery', $payload);

        return (bool) ($response['ok'] ?? false);
    }

    /**
     * Get bot account information.
     */
    public function getMe(?string $botToken = null): ?array
    {
        $token = $this->resolveToken($botToken);
        if (empty($token)) {
            return null;
        }

        $response = $this->get($token, 'getMe');

        return ($response && ($response['ok'] ?? false)) ? ($response['result'] ?? null) : null;
    }

    /**
     * Low-level POST request to Telegram API.
     */
    protected function post(string $token, string $method, array $data = [], ?int $timeout = null): ?array
    {
        $url = "{$this->apiUrl}/bot{$token}/{$method}";

        try {
            $response = Http::timeout($timeout ?? $this->timeout)
                ->asJson()
                ->post($url, $data);

            return $response->json();
        } catch (Throwable $e) {
            Log::warning("TelegramApiService POST {$method} error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Low-level GET request to Telegram API.
     */
    protected function get(string $token, string $method, array $query = []): ?array
    {
        $url = "{$this->apiUrl}/bot{$token}/{$method}";

        try {
            $response = Http::timeout($this->timeout)->get($url, $query);
            return $response->json();
        } catch (Throwable $e) {
            Log::warning("TelegramApiService GET {$method} error: " . $e->getMessage());
            return null;
        }
    }
}
