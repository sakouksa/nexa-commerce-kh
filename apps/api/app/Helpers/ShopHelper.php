<?php

namespace App\Helpers;

use App\Models\ActivityLog;
use App\Models\User;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ShopHelper
{
    public static function requireShopAccess(?int $shopId, ?User $user): void
    {
        if (!$user) {
            throw new HttpException(401, 'Authentication required');
        }
        if ($user->role === 'admin') {
            return;
        }
        if ($shopId !== null && (int) $user->shop_id !== (int) $shopId) {
            throw new HttpException(403, 'You do not have access to this shop');
        }
    }

    public static function logActivity(string $action, string $description, ?int $shopId = null, ?User $user = null): void
    {
        try {
            ActivityLog::create([
                'shop_id' => $shopId,
                'user_id' => $user ? $user->id : null,
                'username' => $user ? $user->username : 'system',
                'action' => $action,
                'description' => $description,
            ]);
        } catch (\Exception $e) {
            // Logging failure should never fail the main request
        }
    }
}
