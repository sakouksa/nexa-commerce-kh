<?php

namespace App\Services\Payment;

use App\Models\Order;
use App\Models\Payment;
use App\Services\AbaService;

class PaymentService
{
    public function __construct(
        protected AbaPayService $abaPayService,
        protected KhqrService $khqrService
    ) {}

    public function createPayment(Order $order, string $method): array
    {
        return match ($method) {
            'aba', 'aba_pay' => $this->abaPayService->generateCheckout($order),
            'khqr' => $this->khqrService->generateKhqr($order),
            default => [
                'success' => true,
                'method' => 'cash',
                'order_id' => $order->id,
            ],
        };
    }

    public function verifyPayment(Order $order, string $transactionId): array
    {
        return AbaService::checkTransactionForShop($order->shop, $transactionId);
    }
}
