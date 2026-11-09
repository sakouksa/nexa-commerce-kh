<?php

namespace App\Helpers;

use App\Models\ActivityLog;
use App\Models\User;
use App\Services\TelegramService;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ShopHelper
{
    public static function requireShopAccess(?int $shopId, ?User $user): void
    {
        if (! $user) {
            throw new HttpException(401, 'Authentication required');
        }
        if ($user->role === 'admin') {
            return;
        }
        if (empty($shopId) || empty($user->shop_id) || (int) $user->shop_id !== (int) $shopId) {
            throw new HttpException(403, 'You do not have access to this shop');
        }
    }

    public static function logActivity(
        string $action,
        string $description,
        ?int $shopId = null,
        ?User $user = null,
        string $status = 'success',
        ?array $properties = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $method = null,
        ?string $url = null
    ): void {
        try {
            $req = request();
            $ip = $ipAddress;
            if (! $ip && $req) {
                $rawIp = $req->header('CF-Connecting-IP')
                    ?: $req->header('X-Forwarded-For')
                    ?: $req->ip();
                if ($rawIp && str_contains($rawIp, ',')) {
                    $rawIp = trim(explode(',', $rawIp)[0]);
                }
                $ip = $rawIp;
            }

            $ua = $userAgent ?: ($req ? $req->userAgent() : null);
            $httpMethod = $method ?: ($req ? $req->method() : null);
            $fullUrl = $url ?: ($req ? $req->fullUrl() : null);

            if (! $user && $req && method_exists($req, 'user') && $req->user()) {
                $user = $req->user();
            }

            if (! $shopId && $user && ! empty($user->shop_id)) {
                $shopId = (int) $user->shop_id;
            }

            $username = $user ? $user->username : ($properties['attempted_username'] ?? 'system');

            ActivityLog::create([
                'shop_id' => $shopId,
                'user_id' => $user ? $user->id : null,
                'username' => $username,
                'action' => $action,
                'description' => $description,
                'ip_address' => $ip ? substr($ip, 0, 45) : null,
                'user_agent' => $ua ? substr($ua, 0, 500) : null,
                'method' => $httpMethod ? substr($httpMethod, 0, 10) : null,
                'url' => $fullUrl ? substr($fullUrl, 0, 500) : null,
                'status' => $status,
                'properties' => $properties,
            ]);

            // Dispatch instant security notification for critical / high-risk activities
            self::checkAndSendSecurityAlert($action, $description, $username, $ip, $status, $properties);
        } catch (\Exception $e) {
            // Logging failure should never fail the main request
        }
    }

    protected static function checkAndSendSecurityAlert(
        string $action,
        string $description,
        string $username,
        ?string $ip,
        string $status,
        ?array $properties
    ): void {
        $criticalActions = [
            'failed_login',
            'account_locked',
            'account_suspended',
            'set_shop_expiry',
            'shop_status',
            'delete_shop',
            'change_password',
            'system_import',
        ];

        if (! in_array($action, $criticalActions, true) && $status !== 'failed') {
            return;
        }

        $botToken = config('telegram.bot_token');
        $adminChatId = config('telegram.admin_chat_id');
        if (empty($botToken) || empty($adminChatId)) {
            return;
        }

        $icon = ($status === 'failed' || $action === 'account_locked') ? '🚨' : '🛡️';
        $time = now()->format('Y-m-d H:i:s');
        $msg = "{$icon} <b>MiniStore Security Audit</b>\n\n";
        $msg .= "• <b>Action:</b> <code>" . htmlspecialchars($action) . "</code>\n";
        $msg .= "• <b>User:</b> <code>" . htmlspecialchars($username) . "</code>\n";
        $msg .= "• <b>Status:</b> <b>" . strtoupper($status) . "</b>\n";
        $msg .= "• <b>IP:</b> <code>" . htmlspecialchars($ip ?? 'Unknown') . "</code>\n";
        $msg .= "• <b>Detail:</b> " . htmlspecialchars($description) . "\n";
        $msg .= "• <b>Time:</b> {$time}";

        try {
            TelegramService::sendTelegramMessage($botToken, $adminChatId, $msg);
        } catch (\Exception $e) {
            // Ignore notification failure
        }
    }
}
