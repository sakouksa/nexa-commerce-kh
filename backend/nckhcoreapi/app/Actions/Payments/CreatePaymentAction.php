<?php

namespace App\Actions\Payments;

use App\Models\Order;
use App\Models\Payment;
use App\Services\Payment\PaymentService;

class CreatePaymentAction
{
    public function __construct(
        protected PaymentService $paymentService
    ) {}

    public function execute(Order $order, string $method = 'aba_pay'): array
    {
        $result = $this->paymentService->createPayment($order, $method);

        Payment::create([
            'order_id' => $order->id,
            'shop_id' => $order->shop_id,
            'transaction_id' => $result['transaction_id'] ?? $order->transaction_id ?? '',
            'payment_method' => $method,
            'amount' => (float) $order->total,
            'currency' => $order->currency ?: 'USD',
            'status' => 'pending',
            'payment_detail' => json_encode($result),
        ]);

        return $result;
    }
}
