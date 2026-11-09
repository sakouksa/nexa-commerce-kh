<?php

namespace App\Services\Orders;

use App\Helpers\ShopHelper;
use App\Models\Order;
use App\Models\Shop;
use App\Services\Documents\PdfReceiptService;
use App\Services\Inventory\StockService;
use App\Services\Telegram\TelegramService;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderService
{
    /**
     * Generate unique order number for a shop.
     */
    public function generateOrderNumber(int $shopId): string
    {
        return 'ORD'.$shopId.'-'.time().'-'.random_int(100, 999);
    }

    /**
     * Mark an order as paid, deduct stock, generate receipt and send notifications within a transaction boundary.
     */
    public function markPaid(Order $order, ?string $transactionId = null): bool
    {
        if ($order->payment_status === 'paid') {
            return false;
        }

        $tx = $transactionId ?: $order->transaction_id;

        $affected = DB::table('orders')
            ->where('id', $order->id)
            ->where('payment_status', '!=', 'paid')
            ->update([
                'payment_status' => 'paid',
                'paid_at' => now(),
                'transaction_id' => $tx,
                'updated_at' => now(),
            ]);

        if ($affected === 0) {
            $order->refresh();

            return false;
        }

        $order->refresh();
        $stockSummary = StockService::deductStockForOrder($order);
        $this->processFirstPayment($order, $stockSummary);

        return true;
    }

    /**
     * Handle post-payment processing: PDF receipt, Telegram notification, low stock alerts, and activity log.
     */
    public function processFirstPayment(Order $order, ?array $stockSummary = null): void
    {
        $shop = $order->shop;
        if (! $shop) {
            return;
        }

        try {
            $items = $order->items->map(fn ($i) => $i->to_dict())->toArray();
            $order->receipt_url = PdfReceiptService::generateReceipt($order, $shop, $items);
            $order->save();
        } catch (Exception $e) {
            Log::warning("Failed to generate PDF receipt for order #{$order->order_number}: ".$e->getMessage());
        }

        $tg = $shop->telegram_dict();
        if (! empty($tg['enabled'])) {
            try {
                TelegramService::notifyShopPaymentSuccessFull($shop, $order, $stockSummary);
            } catch (Exception $e) {
                Log::warning("Failed to send Telegram payment notification for order #{$order->order_number}: ".$e->getMessage());
            }
        }

        try {
            StockService::sendLowStockAlerts($shop);
        } catch (Exception $e) {
            Log::warning("Failed to send low stock alert for shop #{$shop->id}: ".$e->getMessage());
        }

        ShopHelper::logActivity(
            'payment_success',
            "Payment confirmed for #{$order->order_number} ({$order->total} {$order->currency})",
            $order->shop_id
        );
    }
}

