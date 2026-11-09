<?php

namespace App\Actions\Shops;

use App\Models\Shop;
use App\Models\User;
use App\Services\JwtService;
use Symfony\Component\HttpKernel\Exception\HttpException;

class SwitchShopAction
{
    public function __construct(
        protected JwtService $jwtService
    ) {}

    public function execute(User $user, int $newShopId): array
    {
        if ($user->role !== 'admin' && (int) $user->shop_id !== $newShopId) {
            throw new HttpException(403, 'Unauthorized access to target shop');
        }

        $shop = Shop::find($newShopId);
        if (!$shop || $shop->status !== 'active') {
            throw new HttpException(404, 'Shop not found or inactive');
        }

        $token = $this->jwtService->createToken([
            'sub' => (string) $user->id,
            'user_id' => $user->id,
            'role' => $user->role,
            'shop_id' => $shop->id,
        ]);

        return [
            'access_token' => $token,
            'token_type' => 'bearer',
            'shop' => $shop,
        ];
    }
}
