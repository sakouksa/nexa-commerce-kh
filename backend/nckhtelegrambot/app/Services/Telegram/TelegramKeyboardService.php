<?php

namespace App\Services\Telegram;

class TelegramKeyboardService
{
    /**
     * Wrap inline keyboard rows into Telegram reply_markup structure.
     */
    public function buildInlineKeyboard(array $rows): array
    {
        return [
            'inline_keyboard' => $rows,
        ];
    }

    /**
     * Build standard reply keyboard markup.
     */
    public function buildReplyKeyboard(array $buttons, bool $resize = true, bool $oneTime = false): array
    {
        return [
            'keyboard' => $buttons,
            'resize_keyboard' => $resize,
            'one_time_keyboard' => $oneTime,
        ];
    }

    /**
     * Build Mini App button row.
     */
    public function buildMiniAppButton(string $text, string $webAppUrl): array
    {
        return [
            [
                'text' => $text,
                'web_app' => ['url' => $webAppUrl],
            ],
        ];
    }

    /**
     * Build primary Shop Interactive Menu Keyboard.
     */
    public function buildShopMenuKeyboard(array $shop, ?string $miniAppUrl = null): array
    {
        $rows = [];
        $username = $shop['username'] ?? $shop['shop_username'] ?? '';
        $shopId = $shop['id'] ?? $shop['shop_id'] ?? '';

        // Determine Mini App URL with shop query param
        $appBase = $miniAppUrl ?: config('telegram.mini_app_url', 'http://localhost:3006');
        if (!empty($appBase) && !empty($username)) {
            $separator = str_contains($appBase, '?') ? '&' : '?';
            $fullMiniAppUrl = "{$appBase}{$separator}shop={$username}";

            $rows[] = [
                [
                    'text' => '🛍️ បើកទំនិញ / Open Storefront',
                    'web_app' => ['url' => $fullMiniAppUrl],
                ],
            ];
        }

        // Secondary quick-action buttons
        $rows[] = [
            [
                'text' => '📋 បញ្ជីមុខទំនិញ (Menu)',
                'callback_data' => "menu:{$shopId}",
            ],
            [
                'text' => '📦 ពិនិត្យការកម្ម៉ង់ (Orders)',
                'callback_data' => "track_order",
            ],
        ];

        // Third row: Payment info and Contact
        $rows[] = [
            [
                'text' => '💳 ព័ត៌មានទូទាត់ (Payment)',
                'callback_data' => "payment_info:{$shopId}",
            ],
            [
                'text' => 'ℹ️ ព័ត៌មានហាង (About)',
                'callback_data' => "shop_info:{$shopId}",
            ],
        ];

        return $this->buildInlineKeyboard($rows);
    }

    /**
     * Build Order status keyboard.
     */
    public function buildOrderKeyboard(string $orderNumber, ?string $trackingUrl = null): array
    {
        $rows = [];

        if ($trackingUrl) {
            $rows[] = [
                [
                    'text' => '🌐 តាមដានលើវិបសាយ / View Online',
                    'url' => $trackingUrl,
                ],
            ];
        }

        $rows[] = [
            [
                'text' => '🔄 ពិនិត្យស្ថានភាពឡើងវិញ / Refresh Status',
                'callback_data' => "order:{$orderNumber}",
            ],
            [
                'text' => '🔙 ត្រឡប់ទៅម៉ឺនុយ / Main Menu',
                'callback_data' => 'main_menu',
            ],
        ];

        return $this->buildInlineKeyboard($rows);
    }

    /**
     * Build payment details keyboard.
     */
    public function buildPaymentKeyboard(?string $abaCheckoutUrl = null, ?string $orderNumber = null): array
    {
        $rows = [];

        if ($abaCheckoutUrl) {
            $rows[] = [
                [
                    'text' => '📲 បង់ប្រាក់តាម ABA KHQR',
                    'url' => $abaCheckoutUrl,
                ],
            ];
        }

        if ($orderNumber) {
            $rows[] = [
                [
                    'text' => '🔍 ពិនិត្យការទូទាត់ / Check Payment',
                    'callback_data' => "check_pay:{$orderNumber}",
                ],
            ];
        }

        $rows[] = [
            [
                'text' => '🔙 ត្រឡប់ក្រោយ / Back',
                'callback_data' => 'main_menu',
            ],
        ];

        return $this->buildInlineKeyboard($rows);
    }
}
