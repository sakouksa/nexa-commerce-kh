<?php

namespace App\Actions\Telegram;

use App\Services\CoreApi\CoreApiService;
use App\Services\Telegram\TelegramApiService;
use App\Services\Telegram\TelegramKeyboardService;

class HandleMenuAction
{
    public function __construct(
        protected TelegramApiService $apiService,
        protected TelegramKeyboardService $keyboardService,
        protected CoreApiService $coreApiService
    ) {}

    /**
     * Execute the /menu command or callback.
     */
    public function execute(string|int $chatId, ?array $shop = null, ?string $botToken = null): bool
    {
        $shopId = $shop['id'] ?? $shop['shop_id'] ?? null;
        $shopName = htmlspecialchars($shop['shop_name'] ?? $shop['username'] ?? 'Nexa Commerce Store');

        $products = $this->coreApiService->getProducts($shopId ? (int) $shopId : null, 8);

        $lines = [
            "📋 <b>មុខទំនិញពេញនិយមប្រចាំហាង {$shopName}</b>\n",
        ];

        if (empty($products)) {
            $lines[] = "សូមអភ័យទោស បច្ចុប្បន្នមិនទាន់មានទិន្នន័យទំនិញបង្ហាញនៅទីនេះទេ។";
            $lines[] = "សូមចុចប៊ូតុងខាងក្រោមដើម្បីបើក Storefront មើលទំនិញផ្ទាល់។";
        } else {
            foreach ($products as $index => $item) {
                $num = $index + 1;
                $title = htmlspecialchars($item['title'] ?? $item['name'] ?? 'ទំនិញ');
                $price = number_format((float) ($item['price'] ?? 0), 2);
                $stock = isset($item['stock']) ? (int) $item['stock'] : null;
                $stockText = ($stock !== null && $stock <= 5 && $stock > 0) ? " <i>(នៅសល់តែ {$stock})</i>" : "";

                $lines[] = "<b>{$num}. {$title}</b> - \${$price}{$stockText}";
            }

            $lines[] = "\n✨ <i>ចុច \"បើកមើលមុខទំនិញទាំងអស់\" ដើម្បីកម្ម៉ង់ និងជ្រើសរើសទំហំ/ពណ៌!</i>";
        }

        $miniAppUrl = config('telegram.mini_app_url', 'http://localhost:3006');
        if (!empty($shop['username'])) {
            $separator = str_contains($miniAppUrl, '?') ? '&' : '?';
            $miniAppUrl .= "{$separator}shop={$shop['username']}";
        }

        $keyboard = $this->keyboardService->buildInlineKeyboard([
            [
                [
                    'text' => '🛍️ បើកមើលមុខទំនិញទាំងអស់ / View All',
                    'web_app' => ['url' => $miniAppUrl],
                ],
            ],
            [
                [
                    'text' => '🔙 ត្រឡប់ទៅមេម៉ឺនុយ / Main Menu',
                    'callback_data' => 'main_menu',
                ],
            ],
        ]);

        $sent = $this->apiService->sendMessage(
            $chatId,
            implode("\n", $lines),
            $keyboard,
            'HTML',
            $botToken
        );

        return (bool) $sent;
    }
}
