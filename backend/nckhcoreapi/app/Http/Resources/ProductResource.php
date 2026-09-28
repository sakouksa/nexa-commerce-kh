<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'shop_id' => $this->shop_id,
            'category_id' => $this->category_id,
            'name' => $this->name,
            'description' => $this->description ?? '',
            'price' => (float) ($this->price ?? 0),
            'sale_price' => $this->sale_price !== null ? (float) $this->sale_price : null,
            'quantity' => (int) ($this->quantity ?? 0),
            'images' => method_exists($this->resource, 'getImagesArray') ? $this->getImagesArray() : (is_array($this->images) ? $this->images : []),
            'custom_attributes' => method_exists($this->resource, 'getCustomAttributesArray') ? $this->getCustomAttributesArray() : [],
            'variations' => method_exists($this->resource, 'getVariationsArray') ? $this->getVariationsArray() : [],
            'metadata' => (object) (method_exists($this->resource, 'getMetadataDict') ? $this->getMetadataDict() : []),
            'featured' => (bool) $this->featured,
            'status' => $this->status ?? 'active',
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null,
            'category_name' => $this->category ? $this->category->name : null,
        ];
    }
}
