<?php

namespace App\Jobs;

use App\Services\Telegram\TelegramApiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendTelegramMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string|int $chatId,
        public string $text,
        public ?array $replyMarkup = null,
        public string $parseMode = 'HTML',
        public ?string $botToken = null
    ) {}

    /**
     * Execute the job.
     */
    public function handle(TelegramApiService $apiService): void
    {
        $apiService->sendMessage(
            $this->chatId,
            $this->text,
            $this->replyMarkup,
            $this->parseMode,
            $this->botToken
        );
    }
}
