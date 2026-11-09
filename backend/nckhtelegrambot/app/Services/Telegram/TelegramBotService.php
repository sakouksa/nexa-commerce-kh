<?php

namespace App\Services\Telegram;

use App\Actions\Telegram\HandleMenuAction;
use App\Actions\Telegram\HandleOrderAction;
use App\Actions\Telegram\HandlePaymentAction;
use App\Actions\Telegram\HandleStartAction;
use App\Enums\TelegramUpdateType;
use Illuminate\Support\Facades\Log;

class TelegramBotService
{
    public function __construct(
        protected TelegramApiService $apiService,
        protected HandleStartAction $startAction,
        protected HandleMenuAction $menuAction,
        protected HandleOrderAction $orderAction,
        protected HandlePaymentAction $paymentAction
    ) {}

    /**
     * Process an incoming Telegram update.
     */
    public function handleUpdate(array $update, ?string $botToken = null, ?array $shop = null): bool
    {
        $updateType = TelegramUpdateType::fromUpdate($update);

        return match ($updateType) {
            TelegramUpdateType::MY_CHAT_MEMBER => $this->handleMyChatMember($update['my_chat_member'], $botToken, $shop),
            TelegramUpdateType::CALLBACK_QUERY => $this->handleCallbackQuery($update['callback_query'], $botToken, $shop),
            TelegramUpdateType::MESSAGE => $this->handleMessage($update['message'], $botToken, $shop),
            default => true,
        };
    }

    /**
     * Handle bot joining/leaving groups or channels.
     */
    protected function handleMyChatMember(array $memberUpdate, ?string $botToken, ?array $shop): bool
    {
        $newStatus = $memberUpdate['new_chat_member']['status'] ?? '';
        $chatId = $memberUpdate['chat']['id'] ?? null;

        if (!$chatId || !in_array($newStatus, ['member', 'administrator'])) {
            return true;
        }

        $shopName = htmlspecialchars($shop['shop_name'] ?? $shop['username'] ?? 'Nexa Commerce KH');

        $welcome = "👋 <b>ស្វាគមន៍! Bot របស់ {$shopName} ត្រូវបានបន្ថែមចូលក្រុមនេះ!</b> 🏪\n\n"
            . "ដើម្បីទទួលការជូនដំណឹងនៅពេលអតិថិជនបង់ប្រាក់ជោគជ័យ សូមផ្ញើ៖\n"
            . "<code>/link &lt;Profile ID&gt; &lt;Secret Key&gt;</code>\n\n"
            . "💡 លោកអ្នកអាចស្វែងរក Profile ID & Secret Key ក្នុង Dashboard → Telegram Mini App → Payment Alerts។";

        return (bool) $this->apiService->sendMessage($chatId, $welcome, null, 'HTML', $botToken);
    }

    /**
     * Handle Inline Keyboard Callback Queries.
     */
    protected function handleCallbackQuery(array $callback, ?string $botToken, ?array $shop): bool
    {
        $callbackId = $callback['id'] ?? '';
        $data = trim($callback['data'] ?? '');
        $chatId = $callback['message']['chat']['id'] ?? null;

        if (!empty($callbackId)) {
            $this->apiService->answerCallbackQuery($callbackId, null, false, $botToken);
        }

        if (!$chatId || empty($data)) {
            return true;
        }

        if (str_starts_with($data, 'menu')) {
            return $this->menuAction->execute($chatId, $shop, $botToken);
        }

        if (str_starts_with($data, 'order:')) {
            $orderNumber = substr($data, 6);
            return $this->orderAction->execute($chatId, $orderNumber, $shop, $botToken);
        }

        if ($data === 'track_order') {
            return $this->orderAction->execute($chatId, null, $shop, $botToken);
        }

        if (str_starts_with($data, 'payment_info')) {
            return $this->paymentAction->execute($chatId, null, $shop, $botToken);
        }

        if ($data === 'main_menu' || str_starts_with($data, 'shop_info')) {
            return $this->startAction->execute($chatId, null, $shop, $botToken);
        }

        return true;
    }

    /**
     * Handle incoming Telegram text messages.
     */
    protected function handleMessage(array $message, ?string $botToken, ?array $shop): bool
    {
        $chat = $message['chat'] ?? [];
        $chatId = $chat['id'] ?? null;
        $text = trim($message['text'] ?? '');
        $chatType = $chat['type'] ?? 'private';

        if (!$chatId || empty($text)) {
            return true;
        }

        $parts = preg_split('/\s+/', $text, 2);
        $command = strtolower($parts[0]);
        $arguments = $parts[1] ?? null;

        // 1. /start or start
        if ($command === '/start' || $command === 'start') {
            return $this->startAction->execute($chatId, $arguments, $shop, $botToken);
        }

        // 2. /menu or menu
        if ($command === '/menu' || $command === 'menu') {
            return $this->menuAction->execute($chatId, $shop, $botToken);
        }

        // 3. /order or order
        if ($command === '/order' || $command === 'order') {
            return $this->orderAction->execute($chatId, $arguments, $shop, $botToken);
        }

        // 4. /link or link
        if ($command === '/link' || $command === 'link') {
            return $this->paymentAction->execute($chatId, $arguments, $shop, $botToken);
        }

        // 5. /payment or payment
        if ($command === '/payment' || $command === 'payment') {
            return $this->paymentAction->execute($chatId, null, $shop, $botToken);
        }

        // 6. /help or help or /about
        if (in_array($command, ['/help', 'help', '/about', 'about', '/info', 'info'])) {
            return $this->startAction->execute($chatId, null, $shop, $botToken);
        }

        // 7. Auto-reply in private chats for any message
        if ($chatType === 'private') {
            Log::info("TelegramBotService: Auto-replying to private message from chat {$chatId}");
            return $this->startAction->execute($chatId, null, $shop, $botToken);
        }

        return true;
    }
}
