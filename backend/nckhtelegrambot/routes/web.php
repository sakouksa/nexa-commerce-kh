<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application.
|
*/

Route::get('/', function () {
    return response()->json([
        'name' => config('app.name', 'NCKH Telegram Bot'),
        'service' => 'telegram-bot-service',
        'status' => 'running',
        'framework' => 'Laravel ' . app()->version(),
    ]);
});
