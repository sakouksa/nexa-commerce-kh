<?php

namespace App\Jobs;

use App\Services\Telegram\TelegramBotService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessTelegramUpdate implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public array $update,
        public ?string $botToken = null,
        public ?array $shop = null
    ) {}

    /**
     * Execute the job.
     */
    public function handle(TelegramBotService $botService): void
    {
        $botService->handleUpdate($this->update, $this->botToken, $this->shop);
    }
}
