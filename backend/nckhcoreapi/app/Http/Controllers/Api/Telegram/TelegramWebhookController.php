<?php

namespace App\Http\Controllers\Api\Telegram;

use App\Http\Controllers\Controller;
use App\Http\Controllers\TelegramController;
use Illuminate\Http\Request;

class TelegramWebhookController extends Controller
{
    public function handle(Request $request, string $token)
    {
        return app(TelegramController::class)->webhook($request, $token);
    }
}
