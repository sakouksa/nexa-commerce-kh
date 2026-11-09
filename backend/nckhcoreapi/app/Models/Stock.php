<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Stock extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'product_id',
        'quantity',
        'reserved_quantity',
        'safety_stock',
    ];

    protected function casts(): array
    {
        return [
            'shop_id' => 'integer',
            'product_id' => 'integer',
            'quantity' => 'integer',
            'reserved_quantity' => 'integer',
            'safety_stock' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function getAvailableAttribute(): int
    {
        return max(0, $this->quantity - $this->reserved_quantity);
    }
}
