<?php

namespace App\Services\Documents;

use App\Models\Order;
use App\Services\PdfReceiptService as BasePdfReceiptService;

class PdfReceiptService
{
    public function generateReceipt(Order $order): string
    {
        return BasePdfReceiptService::generate($order);
    }
}
