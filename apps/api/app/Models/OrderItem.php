<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'price',
        'quantity',
        'variations',
    ];

    protected function casts(): array
    {
        return [
            'order_id' => 'integer',
            'product_id' => 'integer',
            'price' => 'float',
            'quantity' => 'integer',
        ];
    }

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function getVariationsDict(): array
    {
        if (empty($this->variations)) return [];
        $decoded = json_decode($this->variations, true);
        return is_array($decoded) ? $decoded : [];
    }

    public function to_dict(): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'product_id' => $this->product_id,
            'product_name' => $this->product_name ?? '',
            'price' => (float) ($this->price ?? 0),
            'quantity' => (int) ($this->quantity ?? 1),
            'variations' => (object) $this->getVariationsDict(),
        ];
    }
}
