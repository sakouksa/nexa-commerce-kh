<?php

namespace App\Http\Controllers\Api\Payments;

use App\Http\Controllers\Controller;
use App\Http\Controllers\OrderController;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentWebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();
        $tx = $payload['tran_id'] ?? $payload['transaction_id'] ?? null;
        $status = strtolower((string) ($payload['status'] ?? $payload['transaction_status'] ?? ''));

        if (!$tx) {
            return response()->json(['status' => 'error', 'message' => 'Missing transaction id'], 400);
        }

        $order = Order::where('transaction_id', $tx)->first();
        if (!$order) {
            return response()->json(['status' => 'error', 'message' => 'Order not found'], 404);
        }

        if (in_array($status, ['0', 'approved', 'success', 'paid'])) {
            OrderController::markPaid($order, $tx);
        }

        return response()->json(['status' => 'ok', 'order_id' => $order->id]);
    }
}
