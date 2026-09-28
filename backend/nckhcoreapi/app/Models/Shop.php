<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shop extends Model
{
    use HasFactory;

    protected $fillable = [
        'username',
        'shop_name',
        'logo',
        'banner',
        'bio',
        'description',
        'slideshow',
        'social_media',
        'theme',
        'aba_settings',
        'telegram_settings',
        'currency',
        'status',
        'expires_at',
        'max_products',
        'max_categories',
        'plan',
        'plan_price',
        'plan_discount',
        'plan_started_at',
        'reseller_id',
        'contact',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'plan_started_at' => 'datetime',
            'plan_price' => 'float',
            'plan_discount' => 'float',
            'max_products' => 'integer',
            'max_categories' => 'integer',
        ];
    }

    public function users()
    {
        return $this->hasMany(User::class, 'shop_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'shop_id');
    }

    public function categories()
    {
        return $this->hasMany(Category::class, 'shop_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'shop_id');
    }

    public function customers()
    {
        return $this->hasMany(Customer::class, 'shop_id');
    }

    public function slideshow_list(): array
    {
        if (empty($this->slideshow)) return [];
        $decoded = json_decode($this->slideshow, true);
        return is_array($decoded) ? $decoded : [];
    }

    public function social_media_dict(): array
    {
        if (empty($this->social_media)) return [];
        $decoded = json_decode($this->social_media, true);
        return is_array($decoded) ? $decoded : [];
    }

    public function theme_dict(): array
    {
        if (empty($this->theme)) return [];
        $decoded = json_decode($this->theme, true);
        return is_array($decoded) ? $decoded : [];
    }

    public function aba_dict(): array
    {
        if (empty($this->aba_settings)) return [];
        $decoded = json_decode($this->aba_settings, true);
        return is_array($decoded) ? $decoded : [];
    }

    public function telegram_dict(): array
    {
        if (empty($this->telegram_settings)) return [];
        $decoded = json_decode($this->telegram_settings, true);
        return is_array($decoded) ? $decoded : [];
    }

    public function is_expired(): bool
    {
        return !empty($this->expires_at) && $this->expires_at->isPast();
    }

    public function to_dict(bool $include_private = false): array
    {
        $d = [
            'id' => $this->id,
            'username' => $this->username,
            'shop_name' => $this->shop_name ?? '',
            'logo' => $this->logo ?? '',
            'banner' => $this->banner ?? '',
            'bio' => $this->bio ?? '',
            'description' => $this->description ?? '',
            'slideshow' => $this->slideshow_list(),
            'social_media' => (object) $this->social_media_dict(),
            'theme' => (object) $this->theme_dict(),
            'currency' => $this->currency ?? 'USD',
            'status' => $this->status ?? 'active',
            'max_products' => $this->max_products,
            'max_categories' => $this->max_categories,
            'plan' => $this->plan ?? '',
            'plan_price' => (float) ($this->plan_price ?? 0),
            'plan_discount' => (float) ($this->plan_discount ?? 0),
            'plan_started_at' => $this->plan_started_at ? $this->plan_started_at->toIso8601String() : null,
            'contact' => $this->contact ?? '',
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null,
        ];

        if ($include_private) {
            $d['aba_settings'] = (object) $this->aba_dict();
            $d['telegram_settings'] = (object) $this->telegram_dict();
            $d['expires_at'] = $this->expires_at ? $this->expires_at->toIso8601String() : null;
            $d['reseller_id'] = $this->reseller_id;
        }

        return $d;
    }
}
