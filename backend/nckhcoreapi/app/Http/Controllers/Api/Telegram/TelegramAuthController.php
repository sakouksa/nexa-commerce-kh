<?php

namespace App\Http\Controllers\Api\Telegram;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TelegramAuthController extends Controller
{
    public function login(Request $request)
    {
        return app(AuthController::class)->telegramLogin($request);
    }

    public function miniLogin(Request $request)
    {
        return app(AuthController::class)->telegramMiniLogin($request);
    }

    public function requestCode(Request $request)
    {
        return app(AuthController::class)->requestTelegramCode($request);
    }

    public function verifyCode(Request $request)
    {
        return app(AuthController::class)->verifyTelegramCode($request);
    }
}
