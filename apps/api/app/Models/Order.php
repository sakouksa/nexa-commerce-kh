<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'customer_id',
        'order_number',
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_telegram',
        'customer_address',
        'customer_city',
        'customer_country',
        'customer_note',
        'items_total',
        'shipping_fee',
        'discount',
        'total',
        'currency',
        'payment_method',
        'payment_status',
        'transaction_id',
        'payment_detail',
        'order_status',
        'receipt_url',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'shop_id' => 'integer',
            'customer_id' => 'integer',
            'items_total' => 'float',
            'shipping_fee' => 'float',
            'discount' => 'float',
            'total' => 'float',
            'paid_at' => 'datetime',
        ];
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class, 'shop_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    public function to_dict(bool $include_items = true): array
    {
        $d = [
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

        if ($include_items) {
            $d['items'] = $this->items->map(fn($item) => $item->to_dict())->toArray();
        }

        return $d;
    }
}
