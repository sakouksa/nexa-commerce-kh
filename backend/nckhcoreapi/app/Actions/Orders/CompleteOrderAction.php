<?php

namespace App\Actions\Orders;

use App\Enums\OrderStatus;
use App\Events\OrderCompleted;
use App\Models\Order;

class CompleteOrderAction
{
    public function execute(Order $order): Order
    {
        $order->order_status = OrderStatus::DELIVERED->value;
        $order->save();

        event(new OrderCompleted($order));

        return $order;
    }
}
