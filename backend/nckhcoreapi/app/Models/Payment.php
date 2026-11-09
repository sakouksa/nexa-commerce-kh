<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'shop_id',
        'transaction_id',
        'payment_method',
        'amount',
        'currency',
        'status',
        'payment_detail',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'order_id' => 'integer',
            'shop_id' => 'integer',
            'amount' => 'float',
            'paid_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }
}
