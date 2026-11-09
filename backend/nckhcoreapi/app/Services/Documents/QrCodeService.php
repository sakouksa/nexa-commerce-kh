<?php

namespace App\Services\Documents;

use App\Services\QrService as BaseQrService;

class QrCodeService
{
    public function generateShopQr(string $url, string $logoPath = ''): string
    {
        return BaseQrService::generateShopQr($url, $logoPath);
    }
}
