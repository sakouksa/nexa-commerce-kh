<?php

namespace App\Actions\Payments;

use App\Enums\PaymentStatus;
use App\Exceptions\PaymentException;
use App\Models\Order;
use App\Models\Payment;

class RefundPaymentAction
{
    public function execute(Order $order, ?string $reason = null): array
    {
        if ($order->payment_status !== PaymentStatus::PAID->value && $order->payment_status !== 'paid') {
            throw PaymentException::failed('Order is not paid, cannot refund.');
        }

        $order->payment_status = PaymentStatus::REFUNDED->value;
        $order->save();

        Payment::where('order_id', $order->id)->update([
            'status' => 'refunded',
        ]);

        return [
            'success' => true,
            'order_id' => $order->id,
            'status' => 'refunded',
            'reason' => $reason,
        ];
    }
}
