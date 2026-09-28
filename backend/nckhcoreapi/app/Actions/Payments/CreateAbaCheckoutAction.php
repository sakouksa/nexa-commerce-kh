<?php

namespace App\Actions\Payments;

use App\Models\Order;
use App\Models\Shop;
use App\Services\AbaService;
use App\Services\PaymentNotConfiguredException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CreateAbaCheckoutAction
{
    public function execute(int $orderId, array $urls = []): array
    {
        $order = Order::find($orderId);
        if (!$order) {
            throw new HttpException(404, 'Order not found');
        }

        $shop = $order->shop;
        if (!$shop) {
            throw new HttpException(404, 'Shop not found');
        }

        try {
            $res = AbaService::buildCheckoutUrl(
                $order,
                $shop,
                $urls['success_url'] ?? '',
                $urls['error_url'] ?? '',
                $urls['cancel_url'] ?? ''
            );
        } catch (PaymentNotConfiguredException $e) {
            throw new HttpException(400, $e->getMessage());
        }

        $order->transaction_id = $res['transaction_id'];
        $order->save();

        return $res;
    }
}
