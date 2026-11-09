<?php

namespace App\Actions\Telegram;

use App\Services\CoreApi\CoreApiService;
use App\Services\Telegram\TelegramApiService;
use App\Services\Telegram\TelegramKeyboardService;

class HandleOrderAction
{
    public function __construct(
        protected TelegramApiService $apiService,
        protected TelegramKeyboardService $keyboardService,
        protected CoreApiService $coreApiService
    ) {}

    /**
     * Execute the order tracking action.
     */
    public function execute(
        string|int $chatId,
        ?string $orderNumber = null,
        ?array $shop = null,
        ?string $botToken = null
    ): bool {
        $orderNumber = trim($orderNumber ?? '');

        if (empty($orderNumber)) {
            $prompt = "📦 <b>ពិនិត្យស្ថានភាពការកម្ម៉ង់ / Track Your Order</b>\n\n"
                . "សូមផ្ញើលេខវិក្កយបត្រ (Order Number) របស់លោកអ្នកដូចខាងក្រោម៖\n"
                . "<code>/order ORD-XXXX</code>\n\n"
                . "💡 ឧទាហរណ៍៖ <code>/order ORD-00123</code>";

            $keyboard = $this->keyboardService->buildInlineKeyboard([
                [
                    [
                        'text' => '🔙 ត្រឡប់ទៅមេម៉ឺនុយ / Main Menu',
                        'callback_data' => 'main_menu',
                    ],
                ],
            ]);

            return (bool) $this->apiService->sendMessage(
                $chatId,
                $prompt,
                $keyboard,
                'HTML',
                $botToken
            );
        }

        $order = $this->coreApiService->trackOrder($orderNumber);

        if (!$order) {
            $notFound = "❌ <b>រកមិនឃើញការកម្ម៉ង់លេខ៖ {$orderNumber}</b>\n\n"
                . "សូមពិនិត្យលេខវិក្កយបត្រឡើងវិញ ឬទាក់ទងមកកាន់ខាងហាងផ្ទាល់ដើម្បីជួយសម្រួល។";

            $keyboard = $this->keyboardService->buildInlineKeyboard([
                [
                    [
                        'text' => '🔙 ត្រឡប់ទៅមេម៉ឺនុយ / Main Menu',
                        'callback_data' => 'main_menu',
                    ],
                ],
            ]);

            return (bool) $this->apiService->sendMessage(
                $chatId,
                $notFound,
                $keyboard,
                'HTML',
                $botToken
            );
        }

        // Format Order Details
        $status = strtolower($order['status'] ?? 'pending');
        $statusIcon = match ($status) {
            'paid' => '✅ បានបង់ប្រាក់រួច (Paid)',
            'completed' => '🎉 បានដឹកជញ្ជូនរួច (Completed)',
            'cancelled' => '❌ បានលុបចោល (Cancelled)',
            default => '⏳ រង់ចាំការទូទាត់ (Pending)',
        };

        $totalUsd = number_format((float) ($order['total_amount'] ?? $order['total_price'] ?? 0), 2);
        $customerName = htmlspecialchars($order['customer_name'] ?? $order['customer']['name'] ?? 'អតិថិជន');
        $phone = htmlspecialchars($order['customer_phone'] ?? $order['customer']['phone'] ?? '-');
        $createdAt = htmlspecialchars($order['created_at'] ?? date('Y-m-d H:i'));

        $lines = [
            "🧾 <b>ព័ត៌មានការកម្ម៉ង់លេខ៖ {$orderNumber}</b>",
            "───────────────────",
            "👤 អតិថិជន: <b>{$customerName}</b>",
            "📞 ទូរស័ព្ទ: {$phone}",
            "📅 កាលបរិច្ឆេទ: {$createdAt}",
            "📊 ស្ថានភាព: <b>{$statusIcon}</b>",
            "───────────────────",
            "🛒 <b>មុខទំនិញ៖</b>",
        ];

        $items = $order['items'] ?? $order['order_items'] ?? [];
        if (!empty($items)) {
            foreach ($items as $item) {
                $pName = htmlspecialchars($item['product_name'] ?? $item['title'] ?? 'ទំនិញ');
                $qty = (int) ($item['quantity'] ?? 1);
                $sub = number_format((float) ($item['price'] ?? 0) * $qty, 2);
                $lines[] = "• {$pName} x{$qty} = \${$sub}";
            }
        } else {
            $lines[] = "• ព័ត៌មានមុខទំនិញសរុប";
        }

        $lines[] = "───────────────────";
        $lines[] = "💵 <b>ទឹកប្រាក់សរុប៖ \${$totalUsd}</b>";

        $keyboard = $this->keyboardService->buildOrderKeyboard($orderNumber);

        return (bool) $this->apiService->sendMessage(
            $chatId,
            implode("\n", $lines),
            $keyboard,
            'HTML',
            $botToken
        );
    }
}
