<?php

namespace App\Providers;

use App\Events\OrderCreated;
use App\Events\LowStockAlert;
use App\Listeners\SendTelegramOrderNotification;
use App\Listeners\SendTelegramLowStockNotification;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(OrderCreated::class, SendTelegramOrderNotification::class);
        Event::listen(LowStockAlert::class, SendTelegramLowStockNotification::class);
    }
}
