<?php

namespace App\Services\Telegram;

use App\Models\Shop;
use App\Models\TelegramCode;
use Illuminate\Support\Str;

class TelegramMiniAppService
{
    public function validateInitData(string $initData, string $botToken): bool
    {
        parse_str($initData, $data);
        if (! isset($data['hash'])) {
            return false;
        }

        $checkHash = $data['hash'];
        unset($data['hash']);

        ksort($data);
        $dataCheckString = implode("\n", array_map(
            fn ($k, $v) => "$k=$v",
            array_keys($data),
            array_values($data)
        ));

        $secretKey = hash_hmac('sha256', $botToken, 'WebAppData', true);
        $hash = hash_hmac('sha256', $dataCheckString, $secretKey);

        return hash_equals($hash, $checkHash);
    }

    public function generateLoginCode(Shop $shop, int $telegramId): string
    {
        $code = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        
        TelegramCode::updateOrCreate(
            ['shop_id' => $shop->id, 'telegram_id' => $telegramId],
            [
                'code_hash' => hash('sha256', $code),
                'expires_at' => now()->addMinutes(10),
            ]
        );

        return $code;
    }
}
