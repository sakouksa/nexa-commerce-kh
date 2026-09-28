<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShopResource extends JsonResource
{
    protected bool $includePrivate;

    public function __construct($resource, bool $includePrivate = false)
    {
        parent::__construct($resource);
        $this->includePrivate = $includePrivate;
    }

    public function toArray(Request $request): array
    {
        $d = [
            'id' => $this->id,
            'username' => $this->username,
            'shop_name' => $this->shop_name ?? '',
            'logo' => $this->logo ?? '',
            'banner' => $this->banner ?? '',
            'bio' => $this->bio ?? '',
            'description' => $this->description ?? '',
            'slideshow' => method_exists($this->resource, 'slideshow_list') ? $this->slideshow_list() : [],
            'social_media' => (object) (method_exists($this->resource, 'social_media_dict') ? $this->social_media_dict() : []),
            'theme' => (object) (method_exists($this->resource, 'theme_dict') ? $this->theme_dict() : []),
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

        if ($this->includePrivate) {
            $d['aba_settings'] = (object) (method_exists($this->resource, 'aba_dict') ? $this->aba_dict() : []);
            $d['telegram_settings'] = (object) (method_exists($this->resource, 'telegram_dict') ? $this->telegram_dict() : []);
            $d['expires_at'] = $this->expires_at ? $this->expires_at->toIso8601String() : null;
            $d['reseller_id'] = $this->reseller_id;
        }

        return $d;
    }
}
