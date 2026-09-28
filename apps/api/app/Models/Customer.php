<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Customer extends Authenticatable
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'first_name',
        'last_name',
        'gender',
        'name',
        'username',
        'phone',
        'email',
        'password',
        'telegram',
        'telegram_username',
        'telegram_phone',
        'telegram_id',
        'address',
        'city',
        'country',
        'notes',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'shop_id' => 'integer',
            'telegram_id' => 'integer',
        ];
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class, 'shop_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'customer_id');
    }

    public function getPasswordHashAttribute()
    {
        return $this->password;
    }

    public function setPasswordHashAttribute($value)
    {
        $this->password = $value;
    }

    public function to_dict(): array
    {
        return [
            'id' => $this->id,
            'shop_id' => $this->shop_id,
            'first_name' => $this->first_name ?? '',
            'last_name' => $this->last_name ?? '',
            'gender' => $this->gender ?? '',
            'name' => $this->name ?? '',
            'username' => $this->username ?? '',
            'phone' => $this->phone ?? '',
            'email' => $this->email ?? '',
            'telegram' => $this->telegram ?? '',
            'telegram_username' => $this->telegram_username ?? '',
            'telegram_phone' => $this->telegram_phone ?? '',
            'telegram_id' => $this->telegram_id,
            'address' => $this->address ?? '',
            'city' => $this->city ?? '',
            'country' => $this->country ?? '',
            'notes' => $this->notes ?? '',
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null,
        ];
    }
}
