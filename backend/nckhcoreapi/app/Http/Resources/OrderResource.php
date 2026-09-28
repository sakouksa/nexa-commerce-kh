<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'shop_id' => $this->shop_id,
            'customer_id' => $this->customer_id,
            'order_number' => $this->order_number,
            'customer_name' => $this->customer_name ?? '',
            'customer_email' => $this->customer_email ?? '',
            'customer_phone' => $this->customer_phone ?? '',
            'customer_telegram' => $this->customer_telegram ?? '',
            'customer_address' => $this->customer_address ?? '',
            'customer_city' => $this->customer_city ?? '',
            'customer_country' => $this->customer_country ?? '',
            'customer_note' => $this->customer_note ?? '',
            'items_total' => (float) ($this->items_total ?? 0),
            'shipping_fee' => (float) ($this->shipping_fee ?? 0),
            'discount' => (float) ($this->discount ?? 0),
            'total' => (float) ($this->total ?? 0),
            'currency' => $this->currency ?? 'USD',
            'payment_method' => $this->payment_method ?? 'aba',
            'payment_status' => $this->payment_status ?? 'pending',
            'transaction_id' => $this->transaction_id ?? '',
            'order_status' => $this->order_status ?? 'pending',
            'receipt_url' => $this->receipt_url ?? '',
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null,
            'paid_at' => $this->paid_at ? $this->paid_at->toIso8601String() : null,
            'shop_name' => $this->shop ? $this->shop->shop_name : null,
            'shop_username' => $this->shop ? $this->shop->username : null,
        ];

        if ($this->relationLoaded('items') || $this->items) {
            $data['items'] = OrderItemResource::collection($this->items)->resolve();
        }

        return $data;
    }
}
