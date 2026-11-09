<?php

namespace App\Http\Controllers\Api\V1\Telegram;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TelegramWebhookController extends Controller
{
    public function handle(Request $request, string $token)
    {
        return app(TelegramController::class)->webhook($request, $token);
    }
}
