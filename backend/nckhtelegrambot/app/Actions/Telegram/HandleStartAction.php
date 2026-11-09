<?php

namespace App\Actions\Telegram;

use App\Services\CoreApi\CoreApiService;
use App\Services\Telegram\TelegramApiService;
use App\Services\Telegram\TelegramKeyboardService;

class HandleStartAction
{
    public function __construct(
        protected TelegramApiService $apiService,
        protected TelegramKeyboardService $keyboardService,
        protected CoreApiService $coreApiService
    ) {}

    /**
     * Execute the /start command action.
     */
    public function execute(string|int $chatId, ?string $payload = null, ?array $shop = null, ?string $botToken = null): bool
    {
        // If payload is present and shop not provided, try resolving shop by payload username
        if (empty($shop) && !empty($payload)) {
            $shop = $this->coreApiService->getShop($payload);
        }

        if (!empty($shop)) {
            return $this->handleShopWelcome($chatId, $shop, $botToken);
        }

        return $this->handlePlatformWelcome($chatId, $botToken);
    }

    /**
     * Send rich shop welcome with photo, bio, description, and Mini App button.
     */
    protected function handleShopWelcome(string|int $chatId, array $shop, ?string $botToken): bool
    {
        $name = htmlspecialchars($shop['shop_name'] ?? $shop['username'] ?? 'Nexa Commerce Store');
        $bio = htmlspecialchars(trim($shop['bio'] ?? ''));
        $description = htmlspecialchars(trim($shop['description'] ?? ''));
        $contact = htmlspecialchars(trim($shop['contact'] ?? ''));

        $keyboard = $this->keyboardService->buildShopMenuKeyboard($shop);

        // 1. Send Banner or Logo photo if available
        $mediaUrl = trim($shop['banner'] ?? $shop['logo'] ?? '');
        if (!empty($mediaUrl) && filter_var($mediaUrl, FILTER_VALIDATE_URL)) {
            $captionLines = ["🏪 <b>{$name}</b>"];
            $welcomeText = trim($shop['welcome_km'] ?? $shop['welcome_en'] ?? '');
            if ($welcomeText) {
                $captionLines[] = htmlspecialchars($welcomeText);
            }

            $this->apiService->sendPhoto(
                $chatId,
                $mediaUrl,
                implode("\n", $captionLines),
                $keyboard,
                'HTML',
                $botToken
            );
        }

        // 2. Build full Shop About Text
        $lines = [
            "🏪 <b>{$name}</b>",
        ];

        if ($bio) {
            $lines[] = "\n📝 " . mb_substr($bio, 0, 1000);
        }

        if ($description && $description !== $bio) {
            $lines[] = "\n📄 " . mb_substr($description, 0, 2000);
        }

        if ($contact) {
            $lines[] = "\n📍 " . mb_substr($contact, 0, 500);
        }

        $lines[] = "\n🛍️ <i>ចុចប៊ូតុងខាងក្រោមដើម្បីបើកមើលទំនិញ និងកម្ម៉ង់ភ្លាមៗ!</i>";

        $messageText = implode("\n", $lines);

        $sent = $this->apiService->sendMessage(
            $chatId,
            $messageText,
            $keyboard,
            'HTML',
            $botToken
        );

        return (bool) $sent;
    }

    /**
     * Send default platform greeting when bot is not tied to a single shop.
     */
    protected function handlePlatformWelcome(string|int $chatId, ?string $botToken): bool
    {
        $text = "👋 <b>សូមស្វាគមន៍មកកាន់ Nexa Commerce KH Bot!</b> 🏪\n\n"
            . "ប្រព័ន្ធនេះជួយសម្រួលដល់ការកម្ម៉ង់ទំនិញ ពិនិត្យវិក្កយបត្រ និងទទួលការជូនដំណឹងទូទាត់ប្រាក់ភ្លាមៗ។\n\n"
            . "<b>មុខងារពេញនិយម៖</b>\n"
            . "• /menu - មើលមុខទំនិញពេញនិយម\n"
            . "• /order &lt;លេខវិក្កយបត្រ&gt; - តាមដានស្ថានភាពការកម្ម៉ង់\n"
            . "• /payment - ពិនិត្យព័ត៌មានគណនីទូទាត់ ABA KHQR\n"
            . "• /link &lt;Profile ID&gt; &lt;Secret Key&gt; - ភ្ជាប់ទទួលដំណឹងការបង់ប្រាក់សម្រាប់ម្ចាស់ហាង\n\n"
            . "💡 ប្រសិនបើលោកអ្នកចង់បើកមើលទំនិញ សូមចុចប៊ូតុងខាងក្រោម៖";

        $miniAppUrl = config('telegram.mini_app_url', 'http://localhost:3006');
        $keyboard = $this->keyboardService->buildInlineKeyboard([
            [
                [
                    'text' => '🛍️ បើកទំព័រទំនិញ / Open Storefront',
                    'web_app' => ['url' => $miniAppUrl],
                ],
            ],
            [
                [
                    'text' => '📦 ពិនិត្យការកម្ម៉ង់ (Track Order)',
                    'callback_data' => 'track_order',
                ],
                [
                    'text' => '💳 ព័ត៌មានទូទាត់ (Payment)',
                    'callback_data' => 'payment_info',
                ],
            ],
        ]);

        $sent = $this->apiService->sendMessage(
            $chatId,
            $text,
            $keyboard,
            'HTML',
            $botToken
        );

        return (bool) $sent;
    }
}
