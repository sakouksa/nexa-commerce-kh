<?php

namespace App\Services\Documents;

use BaconQrCode\Common\ErrorCorrectionLevel;
use BaconQrCode\Encoder\Encoder;
use Exception;

class QrService
{
    public static function generateShopQr(string $url, string $logoPath = ''): string
    {
        $code = Encoder::encode($url, ErrorCorrectionLevel::H());
        $matrix = $code->getMatrix();
        $matrixWidth = $matrix->getWidth();
        $matrixHeight = $matrix->getHeight();

        $scale = 10;
        $border = 2;

        $imgWidth = ($matrixWidth + 2 * $border) * $scale;
        $imgHeight = ($matrixHeight + 2 * $border) * $scale;

        $image = imagecreatetruecolor($imgWidth, $imgHeight);
        $white = imagecolorallocate($image, 255, 255, 255);
        $black = imagecolorallocate($image, 0, 0, 0);

        imagefilledrectangle($image, 0, 0, $imgWidth, $imgHeight, $white);

        for ($y = 0; $y < $matrixHeight; $y++) {
            for ($x = 0; $x < $matrixWidth; $x++) {
                if ($matrix->get($x, $y) === 1) {
                    $px = ($x + $border) * $scale;
                    $py = ($y + $border) * $scale;
                    imagefilledrectangle($image, $px, $py, $px + $scale - 1, $py + $scale - 1, $black);
                }
            }
        }

        // Center logo overlay if logo exists
        if (! empty($logoPath) && file_exists($logoPath)) {
            try {
                $logoInfo = getimagesize($logoPath);
                if ($logoInfo) {
                    $mime = $logoInfo['mime'];
                    $srcLogo = null;
                    if ($mime === 'image/jpeg') {
                        $srcLogo = imagecreatefromjpeg($logoPath);
                    } elseif ($mime === 'image/png') {
                        $srcLogo = imagecreatefrompng($logoPath);
                    } elseif ($mime === 'image/webp') {
                        $srcLogo = imagecreatefromwebp($logoPath);
                    }

                    if ($srcLogo) {
                        $logoSize = (int) ($imgWidth * 0.22);
                        $dstX = (int) (($imgWidth - $logoSize) / 2);
                        $dstY = (int) (($imgHeight - $logoSize) / 2);

                        // White background circle/square behind logo
                        imagefilledrectangle($image, $dstX - 4, $dstY - 4, $dstX + $logoSize + 4, $dstY + $logoSize + 4, $white);

                        imagecopyresampled(
                            $image, $srcLogo,
                            $dstX, $dstY, 0, 0,
                            $logoSize, $logoSize,
                            imagesx($srcLogo), imagesy($srcLogo)
                        );
                        imagedestroy($srcLogo);
                    }
                }
            } catch (Exception $e) {
                // logo is optional decorative
            }
        }

        ob_start();
        imagepng($image);
        $pngData = ob_get_clean();
        imagedestroy($image);

        return $pngData;
    }

    public static function generateQrImage(string $data, string $filename): string
    {
        $dir = public_path('uploads/qr');
        if (! file_exists($dir)) {
            mkdir($dir, 0755, true);
        }
        $pngData = self::generateShopQr($data);
        $filepath = "{$dir}/{$filename}";
        file_put_contents($filepath, $pngData);

        return "/uploads/qr/{$filename}";
    }
}

