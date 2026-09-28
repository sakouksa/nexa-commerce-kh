<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Shop;
use Barryvdh\DomPDF\Facade\Pdf;
use Exception;
use Illuminate\Support\Facades\File;

class PdfReceiptService
{
    public static function generateReceipt(Order $order, Shop $shop, array $items): string
    {
        $dir = public_path('uploads/receipts');
        if (!File::exists($dir)) {
            File::makeDirectory($dir, 0755, true);
        }

        $filename = "receipt_{$order->id}.pdf";
        $filepath = "{$dir}/{$filename}";

        $pdf = Pdf::loadView('receipt', [
            'order' => $order,
            'shop' => $shop,
            'items' => $items,
        ])->setPaper('a4', 'portrait');

        $pdf->save($filepath);

        return "/uploads/receipts/{$filename}";
    }
}
