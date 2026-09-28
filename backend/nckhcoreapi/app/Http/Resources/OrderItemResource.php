<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'product_id' => $this->product_id,
            'product_name' => $this->product_name,
            'price' => (float) ($this->price ?? 0),
            'quantity' => (int) ($this->quantity ?? 1),
            'variations' => is_string($this->variations) ? json_decode($this->variations, true) : ($this->variations ?? []),
        ];
    }
}
