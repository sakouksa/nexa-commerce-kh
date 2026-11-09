<?php

namespace App\Actions\Payments;

use App\Http\Controllers\Api\V1\Orders\OrderController;
use App\Models\Order;
use App\Services\Payment\AbaService;
use Symfony\Component\HttpKernel\Exception\HttpException;

class VerifyAbaPaymentAction
{
    public function execute(int $orderId, ?string $transactionId = null): array
    {
        $order = Order::find($orderId);
        if (! $order) {
            throw new HttpException(404, 'Order not found');
        }

        $shop = $order->shop;
        if (! $shop) {
            throw new HttpException(404, 'Shop not found');
        }

        $tx = $transactionId ?: $order->transaction_id;

        if ($order->payment_status === 'paid') {
            return [
                'verified' => true,
                'status' => 'paid',
                'payment_status' => 'paid',
                'amount' => $order->total,
                'transaction_id' => $order->transaction_id ?: $tx,
                'order_number' => $order->order_number,
                'total' => $order->total,
                'currency' => $order->currency,
            ];
        }

        $result = AbaService::verifyPayment($order, $shop, $tx);
        if (! empty($result['verified'])) {
            OrderController::markPaid($order, $result['transaction_id'] ?? $tx);
            $order->refresh();
        }

        $result['payment_status'] = $order->payment_status;
        $result['order_number'] = $order->order_number;
        $result['total'] = $order->total;
        $result['currency'] = $order->currency;

        return $result;
    }
}
