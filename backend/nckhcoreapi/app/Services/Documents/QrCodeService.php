<?php

namespace App\Services\Documents;

class QrCodeService extends QrService
{
    public function generateShopQrInstance(string $url, string $logoPath = ''): string
    {
        return self::generateShopQr($url, $logoPath);
    }
}
