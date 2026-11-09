<?php

namespace App\Actions\Orders;

use App\Helpers\ShopHelper;
use App\Http\Controllers\Api\V1\Orders\OrderController;
use App\Models\Order;
use App\Models\User;
use Symfony\Component\HttpKernel\Exception\HttpException;

class UpdateOrderStatusAction
{
    public function execute(int $orderId, array $data, User $user): Order
    {
        $order = Order::find($orderId);
        if (! $order) {
            throw new HttpException(404, 'Order not found');
        }

        ShopHelper::requireShopAccess($order->shop_id, $user);

        if (! empty($data['payment_status']) && $data['payment_status'] === 'paid') {
            OrderController::markPaid($order);
        }

        if (isset($data['order_status'])) {
            $order->order_status = $data['order_status'];
        }
        if (isset($data['payment_status'])) {
            $order->payment_status = $data['payment_status'];
        }

        $order->save();
        ShopHelper::logActivity('update_order_status', "Order #{$order->order_number} status updated to {$order->order_status}/{$order->payment_status}", $order->shop_id, $user);

        return $order;
    }
}
