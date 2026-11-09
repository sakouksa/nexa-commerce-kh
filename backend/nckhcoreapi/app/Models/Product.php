<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'category_id',
        'name',
        'description',
        'price',
        'sale_price',
        'quantity',
        'images',
        'custom_attributes',
        'variations',
        'metadata_json',
        'featured',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'shop_id' => 'integer',
            'category_id' => 'integer',
            'price' => 'float',
            'sale_price' => 'float',
            'quantity' => 'integer',
            'featured' => 'boolean',
        ];
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class, 'shop_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function getImagesArray(): array
    {
        if (empty($this->images)) {
            return [];
        }
        $decoded = json_decode($this->images, true);

        return is_array($decoded) ? $decoded : [];
    }

    public function getCustomAttributesArray(): array
    {
        if (empty($this->custom_attributes)) {
            return [];
        }
        $decoded = json_decode($this->custom_attributes, true);

        return is_array($decoded) ? $decoded : [];
    }

    public function getVariationsArray(): array
    {
        if (empty($this->variations)) {
            return [];
        }
        $decoded = json_decode($this->variations, true);

        return is_array($decoded) ? $decoded : [];
    }

    public function getMetadataDict(): array
    {
        if (empty($this->metadata_json)) {
            return [];
        }
        $decoded = json_decode($this->metadata_json, true);

        return is_array($decoded) ? $decoded : [];
    }

    public function to_dict(): array
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
            'images' => $this->getImagesArray(),
            'custom_attributes' => $this->getCustomAttributesArray(),
            'variations' => $this->getVariationsArray(),
            'metadata' => (object) $this->getMetadataDict(),
            'featured' => (bool) $this->featured,
            'status' => $this->status ?? 'active',
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null,
            'category_name' => $this->category ? $this->category->name : null,
        ];
    }
}
