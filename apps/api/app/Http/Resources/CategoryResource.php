<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'shop_id' => $this->shop_id,
            'name' => $this->name,
            'description' => $this->description ?? '',
            'icon' => $this->icon ?? '',
            'image' => $this->image ?? '',
            'display_order' => (int) ($this->display_order ?? 0),
            'product_count' => method_exists($this->resource, 'products') ? $this->products()->count() : 0,
        ];
    }
}
