<?php

use App\Http\Controllers\Telegram\WebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application.
|
*/

// Health Check
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'nckhtelegrambot',
        'timestamp' => now()->toISOString(),
    ]);
});

// Telegram Webhook Endpoint (Supports per-shop bot token in route param)
Route::post('/telegram/webhook/{token?}', [WebhookController::class, 'handle'])
    ->name('telegram.webhook');
