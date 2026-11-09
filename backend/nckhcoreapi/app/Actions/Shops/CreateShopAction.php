<?php

namespace App\Actions\Shops;

use App\Models\Shop;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CreateShopAction
{
    public function execute(array $data): Shop
    {
        $username = trim($data['username'] ?? '');
        $shopName = trim($data['shop_name'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';
        $currency = $data['currency'] ?? 'USD';

        if (!$username || !$password) {
            throw new HttpException(400, 'Username and password are required');
        }

        if (Shop::where('username', $username)->exists() || User::where('username', $username)->exists()) {
            throw new HttpException(400, 'Username already exists');
        }

        return DB::transaction(function () use ($username, $shopName, $currency, $email, $password) {
            $shop = Shop::create([
                'username' => $username,
                'shop_name' => $shopName ?: $username,
                'currency' => $currency,
            ]);

            User::create([
                'username' => $username,
                'email' => $email,
                'password' => Hash::make($password),
                'role' => 'shop_owner',
                'shop_id' => $shop->id,
            ]);

            return $shop;
        });
    }
}
