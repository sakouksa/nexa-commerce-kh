<?php

namespace App\Actions\Orders;

use App\Enums\OrderStatus;
use App\Exceptions\OrderException;
use App\Models\Order;
use App\Services\StockService;

class CancelOrderAction
{
    public function execute(Order $order, string $reason = ''): Order
    {
        if ($order->order_status === OrderStatus::DELIVERED->value) {
            throw OrderException::cannotCancel($order->id);
        }

        $order->order_status = OrderStatus::CANCELLED->value;
        if (!empty($reason)) {
            $order->customer_note = trim(($order->customer_note ? $order->customer_note . " | " : "") . "Cancelled: {$reason}");
        }
        $order->save();

        // Restore stock
        StockService::restoreStockForOrder($order);

        return $order;
    }
}
