<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'username',
        'email',
        'password',
        'role',
        'shop_id',
        'status',
        'referral_code',
        'commission_rate',
        'discount_max',
        'promo_discount',
        'commission_paid',
        'commission_paid_at',
        'login_failed_count',
        'login_locked_count',
        'login_locked_until',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'commission_rate' => 'float',
            'discount_max' => 'float',
            'promo_discount' => 'float',
            'commission_paid_at' => 'datetime',
            'login_locked_until' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class, 'shop_id');
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
            'username' => $this->username,
            'email' => $this->email ?? '',
            'role' => $this->role,
            'shop_id' => $this->shop_id,
            'shop_name' => $this->shop ? $this->shop->shop_name : null,
            'status' => $this->status,
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null,
        ];
    }
}
