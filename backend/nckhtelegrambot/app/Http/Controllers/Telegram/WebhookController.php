<?php

namespace App\Http\Controllers\Telegram;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessTelegramUpdate;
use App\Services\CoreApi\CoreApiService;
use App\Services\Telegram\TelegramBotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function __construct(
        protected TelegramBotService $botService,
        protected CoreApiService $coreApiService
    ) {}

    /**
     * Handle incoming webhook requests from Telegram.
     */
    public function handle(Request $request, ?string $token = null): JsonResponse
    {
        // Validate optional secret token header
        $secretToken = config('telegram.webhook_secret');
        if (!empty($secretToken)) {
            $headerSecret = $request->header('X-Telegram-Bot-Api-Secret-Token');
            if ($headerSecret !== $secretToken) {
                Log::warning('Webhook rejected: Invalid X-Telegram-Bot-Api-Secret-Token header.');
                return response()->json(['ok' => false, 'error' => 'Unauthorized'], 401);
            }
        }

        $update = $request->all();

        if (empty($update)) {
            return response()->json(['ok' => true]);
        }

        $botToken = $token ?: config('telegram.bot_token');

        // Check if queue is configured or run immediately
        if (config('queue.default') === 'sync') {
            $this->botService->handleUpdate($update, $botToken);
        } else {
            ProcessTelegramUpdate::dispatch($update, $botToken);
        }

        return response()->json(['ok' => true]);
    }
}
