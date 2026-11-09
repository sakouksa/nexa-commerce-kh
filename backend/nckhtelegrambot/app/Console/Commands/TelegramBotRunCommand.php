<?php

namespace App\Console\Commands;

use App\Services\CoreApi\CoreApiService;
use App\Services\Telegram\TelegramApiService;
use App\Services\Telegram\TelegramBotService;
use Illuminate\Console\Command;
use Throwable;

class TelegramBotRunCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'telegram:bot:run
                            {--token= : Specific bot token to poll}
                            {--poll-interval= : Delay between polling cycles in seconds}
                            {--once : Run only a single polling loop and exit (useful for testing & cron)}';

    /**
     * The console command description.
     */
    protected $description = 'Run the Telegram Bot long-polling daemon for multi-shop storefronts & payment alerts';

    protected bool $running = true;

    public function __construct(
        protected TelegramApiService $apiService,
        protected TelegramBotService $botService,
        protected CoreApiService $coreApiService
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('========================================================');
        $this->info(' Nexa Commerce KH - Laravel Telegram Bot Worker');
        $this->info('========================================================');

        $customToken = $this->option('token');
        $pollInterval = (float) ($this->option('poll-interval') ?: config('telegram.poll_interval', 0.5));
        $runOnce = (bool) $this->option('once');

        // Handle PCNTL signals for graceful exit if available
        if (function_exists('pcntl_async_signals') && function_exists('pcntl_signal')) {
            pcntl_async_signals(true);
            pcntl_signal(SIGINT, fn() => $this->stop());
            pcntl_signal(SIGTERM, fn() => $this->stop());
        }

        $offsets = [];
        $webhookCleared = [];
        $lastHeartbeat = time();
        $cachedShops = [];
        $lastShopsFetch = 0;

        $this->info("Worker started. Polling interval: {$pollInterval}s");

        while ($this->running) {
            try {
                // If specific token passed, poll only this token
                if (!empty($customToken)) {
                    $shops = [
                        [
                            'bot_token' => $customToken,
                            'shop_name' => 'Custom Bot',
                            'username' => 'custom',
                        ],
                    ];
                } else {
                    // Refresh connected shops list every 30 seconds
                    if (time() - $lastShopsFetch > 30) {
                        $cachedShops = $this->coreApiService->getConnectedShops();
                        $lastShopsFetch = time();

                        // Fallback: If no shops returned from Core API, check if default bot token configured
                        $defaultToken = config('telegram.bot_token');
                        if (empty($cachedShops) && !empty($defaultToken)) {
                            $cachedShops = [
                                [
                                    'bot_token' => $defaultToken,
                                    'shop_name' => config('app.name', 'MiniStoreKH'),
                                    'username' => config('telegram.bot_username', 'platform'),
                                ],
                            ];
                        }
                    }
                    $shops = $cachedShops;
                }

                // Poll each configured shop bot
                foreach ($shops as $shop) {
                    $token = trim($shop['bot_token'] ?? '');
                    if (empty($token)) {
                        continue;
                    }

                    // Ensure webhook is removed once so polling getUpdates works
                    if (!isset($webhookCleared[$token])) {
                        $this->apiService->deleteWebhook(false, $token);
                        $webhookCleared[$token] = true;
                        $shopName = $shop['shop_name'] ?? $shop['username'] ?? 'Shop';
                        $this->line(" [✓] Polling enabled for {$shopName} (" . substr($token, 0, 10) . '...)');
                    }

                    $offset = $offsets[$token] ?? 0;
                    $updates = $this->apiService->getUpdates($offset + 1, 100, 0, ['message', 'callback_query', 'my_chat_member'], $token);

                    foreach ($updates as $upd) {
                        $updateId = $upd['update_id'] ?? 0;
                        $offsets[$token] = max($offsets[$token] ?? 0, $updateId);

                        try {
                            $this->botService->handleUpdate($upd, $token, $shop);
                        } catch (Throwable $e) {
                            $this->error("Error processing update {$updateId}: " . $e->getMessage());
                        }
                    }
                }

                // Log heartbeat every 60 seconds
                if (time() - $lastHeartbeat >= 60) {
                    $lastHeartbeat = time();
                    $botCount = count($shops);
                    $this->comment(date('Y-m-d H:i:s') . " [HEARTBEAT] Worker healthy. Monitoring {$botCount} active bot(s).");
                }

            } catch (Throwable $e) {
                $this->error('Polling loop exception: ' . $e->getMessage());
                sleep(2);
            }

            if ($runOnce) {
                $this->info('Completed single polling cycle (--once). Exiting.');
                break;
            }

            usleep((int) ($pollInterval * 1000000));
        }

        $this->info('Worker stopped gracefully.');
        return Command::SUCCESS;
    }

    /**
     * Stop the polling loop.
     */
    public function stop(): void
    {
        $this->info('Received termination signal. Shutting down worker...');
        $this->running = false;
    }
}
