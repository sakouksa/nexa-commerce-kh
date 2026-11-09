<?php

namespace App\Providers;

use App\Services\CoreApi\CoreApiService;
use App\Services\Telegram\TelegramApiService;
use App\Services\Telegram\TelegramBotService;
use App\Services\Telegram\TelegramKeyboardService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(TelegramApiService::class, function () {
            return new TelegramApiService();
        });

        $this->app->singleton(TelegramKeyboardService::class, function () {
            return new TelegramKeyboardService();
        });

        $this->app->singleton(CoreApiService::class, function () {
            return new CoreApiService();
        });

        $this->app->singleton(TelegramBotService::class, function ($app) {
            return new TelegramBotService(
                $app->make(TelegramApiService::class),
                $app->make(\App\Actions\Telegram\HandleStartAction::class),
                $app->make(\App\Actions\Telegram\HandleMenuAction::class),
                $app->make(\App\Actions\Telegram\HandleOrderAction::class),
                $app->make(\App\Actions\Telegram\HandlePaymentAction::class)
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
