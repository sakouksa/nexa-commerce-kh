<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'shop_id' => $this->shop_id,
            'product_id' => $this->product_id,
            'quantity' => (int) $this->quantity,
            'reserved_quantity' => (int) ($this->reserved_quantity ?? 0),
            'available' => (int) ($this->available ?? max(0, $this->quantity - ($this->reserved_quantity ?? 0))),
            'safety_stock' => (int) ($this->safety_stock ?? 0),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
