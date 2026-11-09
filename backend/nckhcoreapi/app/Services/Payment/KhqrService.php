<?php

namespace App\Services\Payment;

use App\Models\Order;

class KhqrService
{
    public function generateKhqr(Order $order): array
    {
        $shop = $order->shop;
        $amount = (float) $order->total;
        $currency = $order->currency ?: 'USD';

        return [
            'qr_string' => "KHQR:{$shop?->id}:{$order->order_number}:{$amount}:{$currency}",
            'md5' => md5("{$order->order_number}{$amount}{$currency}"),
            'amount' => $amount,
            'currency' => $currency,
        ];
    }

    public function verifyKhqr(string $md5): bool
    {
        return ! empty($md5);
    }
}
