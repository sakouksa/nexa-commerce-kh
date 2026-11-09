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
            'slug' => $this->slug ?? '',
            'parent_id' => $this->parent_id,
            'image' => $this->image ?? '',
            'sort_order' => (int) ($this->sort_order ?? 0),
            'display_order' => (int) ($this->sort_order ?? 0),
            'product_count' => (int) ($this->products_count ?? ($this->relationLoaded('products') ? $this->products->count() : 0)),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
