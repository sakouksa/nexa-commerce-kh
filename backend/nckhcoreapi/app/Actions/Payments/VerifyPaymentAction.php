<?php

namespace App\Actions\Payments;

use App\Events\PaymentVerified;
use App\Models\Order;
use App\Models\Payment;
use App\Services\AbaService;
use Symfony\Component\HttpKernel\Exception\HttpException;

class VerifyPaymentAction
{
    public function execute(int $orderId, ?string $transactionId = null): array
    {
        $order = Order::find($orderId);
        if (!$order) {
            throw new HttpException(404, 'Order not found');
        }

        $shop = $order->shop;
        if (!$shop) {
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
        if (!empty($result['verified'])) {
            $order->payment_status = 'paid';
            $order->transaction_id = $result['transaction_id'] ?? $tx;
            $order->paid_at = now();
            $order->save();

            Payment::where('order_id', $order->id)->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);

            event(new PaymentVerified($order, null, $result));
        }

        $result['payment_status'] = $order->payment_status;
        $result['order_number'] = $order->order_number;
        $result['total'] = $order->total;
        $result['currency'] = $order->currency;

        return $result;
    }
}
