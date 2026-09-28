<?php

namespace App\Http\Controllers;

use App\Helpers\ShopHelper;
use App\Models\ActivityLog;
use App\Models\Shop;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class TelegramController extends Controller
{
    public function webhook(Request $request, string $token)
    {
        $update = $request->all();

        // Bot added to a group -> welcome with LINK command
        $myChatMember = $update['my_chat_member'] ?? null;
        if ($myChatMember) {
            $newStatus = $myChatMember['new_chat_member']['status'] ?? '';
            $newChatId = $myChatMember['chat']['id'] ?? null;
            if ($newStatus === 'member' && $newChatId) {
                foreach (Shop::all() as $s) {
                    $tg = $s->telegram_dict();
                    if (trim($tg['bot_token'] ?? '') === $token) {
                        $profile = TelegramService::ensureShopProfile($s);
                        $shopName = $s->shop_name ?: $s->username;
                        $msg = "👋 ស្វាគមន៍! Bot របស់ <b>{$shopName}</b> ត្រូវបានបន្ថែមចូលក្រុមនេះ! 🏪\n\n" .
                               "ដើម្បីទទួល <b>ការជូនដំណឹងការបង់ប្រាក់ជោគជ័យ</b> របស់ហាងនៅទីនេះ សូមផ្ញើ:\n\n" .
                               "<code>LINK {$profile['profile_id']} {$profile['secret_key']}</code>\n\n" .
                               "អ្នកនឹងទទួលបានតែការជូនដំណឹងពេលអតិថិជនបង់ប្រាក់រួច ជាមួយព័ត៌មានលម្អិត + ស្តុក។";
                        TelegramService::sendTelegramMessage($token, (string) $newChatId, $msg);
                        break;
                    }
                }
            }
            return response()->json(['ok' => true]);
        }

        $message = $update['message'] ?? null;
        if (!$message) return response()->json(['ok' => true]);

        $chatId = $message['chat']['id'] ?? null;
        $text = trim($message['text'] ?? '');
        if (!$chatId || !$text) return response()->json(['ok' => true]);

        // Find shop with this token
        $shop = null;
        foreach (Shop::all() as $s) {
            if (trim($s->telegram_dict()['bot_token'] ?? '') === $token) {
                $shop = $s;
                break;
            }
        }
        if (!$shop) return response()->json(['ok' => true]);

        $lower = strtolower($text);
        if ($lower === '/start' || $lower === 'start') {
            $profile = TelegramService::ensureShopProfile($shop);
            $shopName = $shop->shop_name ?: $shop->username;
            $reply = "សូមស្វាគមន៍មកកាន់ <b>{$shopName}</b>! 🏪\n\n" .
                     "ដើម្បីទទួល <b>ការជូនដំណឹងនៅពេលអតិថិជនបង់ប្រាក់ជោគជ័យ</b> (ព័ត៌មានលម្អិតទំនិញ + ស្តុក) នៅក្នុង chat នេះ សូមផ្ញើ:\n\n" .
                     "<code>LINK {$profile['profile_id']} {$profile['secret_key']}</code>\n\n" .
                     "អ្នកអាចរក Profile ID និង Secret Key នៅក្នុង <b>Shop Dashboard → Telegram Bot</b> ។";
            TelegramService::sendTelegramMessage($token, (string) $chatId, $reply);
        } elseif (str_starts_with($lower, 'link ')) {
            $parts = explode(' ', $text);
            if (count($parts) >= 3) {
                $pid = $parts[1];
                $sec = $parts[2];
                $matched = null;
                foreach (Shop::all() as $s) {
                    $tg = $s->telegram_dict();
                    if (($tg['profile_id'] ?? '') === $pid && ($tg['secret_key'] ?? '') === $sec) {
                        $matched = $s;
                        break;
                    }
                }
                if ($matched) {
                    $tg = $matched->telegram_dict();
                    $chats = $tg['linked_chats'] ?? [];
                    if (!in_array($chatId, $chats)) {
                        $chats[] = $chatId;
                        $tg['linked_chats'] = $chats;
                        $matched->telegram_settings = json_encode($tg, JSON_UNESCAPED_UNICODE);
                        $matched->save();
                    }
                    $reply = "✅ <b>ភ្ជាប់ជោគជ័យ!</b>\n\n" .
                             "Chat នេះត្រូវបានភ្ជាប់ទៅកាន់ <b>" . ($matched->shop_name ?: $matched->username) . "</b>។ " .
                             "រាល់ពេលមានអតិថិជនបង់ប្រាក់ជោគជ័យ អ្នកនឹងទទួលបានព័ត៌មានលម្អិតនៅទីនេះ។";
                    TelegramService::sendTelegramMessage($token, (string) $chatId, $reply);
                } else {
                    TelegramService::sendTelegramMessage($token, (string) $chatId, "❌ Profile ID ឬ Secret Key មិនត្រឹមត្រូវទេ។");
                }
            }
        }

        return response()->json(['ok' => true]);
    }

    public function test(Request $request)
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id', $user->shop_id);
        ShopHelper::requireShopAccess($shopId, $user);

        $shop = Shop::find($shopId);
        if (!$shop) {
            throw new HttpException(404, 'Shop not found');
        }

        $message = $request->input('message', '🧪 Test notification from Mini Shop Platform');
        $ok = TelegramService::sendShopNotification($shop, $message);

        if (!$ok) {
            throw new HttpException(400, 'Could not send test message. Check bot token and ensure the bot has been started.');
        }

        return response()->json(['ok' => true, 'detail' => 'Test message sent!']);
    }

    public function logs(Request $request)
    {
        $user = $request->user();
        $shopId = $request->input('shop_id', $user->shop_id);
        if ($shopId) {
            ShopHelper::requireShopAccess((int) $shopId, $user);
            $logs = ActivityLog::where('shop_id', (int) $shopId)->orderBy('id', 'desc')->take(50)->get();
        } else {
            if ($user->role !== 'admin') {
                throw new HttpException(403, 'Admin privileges required');
            }
            $logs = ActivityLog::orderBy('id', 'desc')->take(50)->get();
        }

        return response()->json($logs->map(fn($l) => $l->to_dict())->toArray());
    }

    public function profile(Request $request, int $shopId)
    {
        $user = $request->user();
        ShopHelper::requireShopAccess($shopId, $user);

        $shop = Shop::find($shopId);
        if (!$shop) {
            throw new HttpException(404, 'Shop not found');
        }

        $tg = TelegramService::ensureShopProfile($shop);
        $botToken = trim($tg['bot_token'] ?? '');

        return response()->json([
            'shop_id' => $shop->id,
            'profile_id' => $tg['profile_id'] ?? null,
            'secret_key' => $tg['secret_key'] ?? null,
            'bot_username' => $botToken ? TelegramService::getBotUsername($botToken) : null,
            'linked_chats' => $tg['linked_chats'] ?? [],
        ]);
    }

    public function linkChat(Request $request)
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id');
        $chatId = $request->input('chat_id');
        ShopHelper::requireShopAccess($shopId, $user);

        $shop = Shop::find($shopId);
        if (!$shop) {
            throw new HttpException(404, 'Shop not found');
        }

        $tg = $shop->telegram_dict();
        $chats = $tg['linked_chats'] ?? [];
        if (!in_array($chatId, $chats)) {
            $chats[] = $chatId;
            $tg['linked_chats'] = $chats;
            $shop->telegram_settings = json_encode($tg, JSON_UNESCAPED_UNICODE);
            $shop->save();
        }

        return response()->json(['ok' => true, 'linked_chats' => $tg['linked_chats']]);
    }

    public function unlinkChat(Request $request)
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id');
        $chatId = $request->input('chat_id');
        ShopHelper::requireShopAccess($shopId, $user);

        $shop = Shop::find($shopId);
        if (!$shop) {
            throw new HttpException(404, 'Shop not found');
        }

        $tg = $shop->telegram_dict();
        $chats = array_values(array_filter($tg['linked_chats'] ?? [], fn($c) => (string)$c !== (string)$chatId));
        $tg['linked_chats'] = $chats;
        $shop->telegram_settings = json_encode($tg, JSON_UNESCAPED_UNICODE);
        $shop->save();

        return response()->json(['ok' => true, 'linked_chats' => $tg['linked_chats']]);
    }

    public function setWebhook(Request $request)
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id');
        ShopHelper::requireShopAccess($shopId, $user);

        $shop = Shop::find($shopId);
        if (!$shop) {
            throw new HttpException(404, 'Shop not found');
        }

        $tg = TelegramService::ensureShopProfile($shop);
        $botToken = trim($tg['bot_token'] ?? '');
        if (!$botToken) {
            throw new HttpException(400, 'Bot token is not configured');
        }

        $baseUrl = config('app.url');
        $webhookUrl = "{$baseUrl}/api/telegram/webhook/{$botToken}";

        try {
            $resp = \Illuminate\Support\Facades\Http::timeout(20)->post("https://api.telegram.org/bot{$botToken}/setWebhook", [
                'url' => $webhookUrl,
                'allowed_updates' => ['message', 'my_chat_member'],
            ]);
            $data = $resp->json() ?? [];
        } catch (\Exception $e) {
            throw new HttpException(500, "Could not reach Telegram: " . $e->getMessage());
        }

        if (empty($data['ok'])) {
            throw new HttpException(400, $data['description'] ?? 'setWebhook failed');
        }

        return response()->json([
            'ok' => true,
            'detail' => 'Webhook registered. Users can now start the bot and link your shop.',
            'profile_id' => $tg['profile_id'] ?? null,
            'secret_key' => $tg['secret_key'] ?? null,
            'webhook_url' => $webhookUrl,
            'linked_chats' => $tg['linked_chats'] ?? [],
        ]);
    }

    public function settings(Request $request)
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id');
        ShopHelper::requireShopAccess($shopId, $user);

        $shop = Shop::find($shopId);
        if (!$shop) {
            throw new HttpException(404, 'Shop not found');
        }

        $tg = TelegramService::ensureShopProfile($shop);
        $botToken = trim($tg['bot_token'] ?? '');

        return response()->json([
            'bot_token' => $botToken,
            'chat_id' => $tg['chat_id'] ?? '',
            'enabled' => !empty($tg['enabled']),
            'profile_id' => $tg['profile_id'] ?? '',
            'secret_key' => $tg['secret_key'] ?? '',
            'linked_chats' => $tg['linked_chats'] ?? [],
            'bot_username' => $botToken ? TelegramService::getBotUsername($botToken) : null,
        ]);
    }

    public function sendStockAlert(Request $request)
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id');
        ShopHelper::requireShopAccess($shopId, $user);

        $shop = Shop::find($shopId);
        if (!$shop) {
            throw new HttpException(404, 'Shop not found');
        }

        $ok = \App\Services\StockService::sendLowStockAlerts($shop);
        if (!$ok) {
            throw new HttpException(400, 'No low-stock items, or the bot token / chat ID is not configured in Telegram Settings');
        }

        return response()->json(['ok' => true, 'detail' => 'Low-stock alert sent to your Telegram group']);
    }

    public function listActivity(Request $request)
    {
        $user = $request->user();
        $shopId = $request->filled('shop_id') ? (int) $request->input('shop_id') : null;
        $username = trim((string) $request->input('username', ''));
        $limit = min(500, max(1, (int) $request->input('limit', 100)));

        $q = ActivityLog::query();
        if ($user->role !== 'admin') {
            $q->where('shop_id', $user->shop_id);
        } elseif ($shopId !== null) {
            $q->where('shop_id', $shopId);
        }

        if ($username) {
            $q->where('username', 'like', "%{$username}%");
        }

        $logs = $q->orderBy('id', 'desc')->limit($limit)->get();
        return response()->json($logs->map(fn($l) => $l->to_dict())->toArray());
    }
}

