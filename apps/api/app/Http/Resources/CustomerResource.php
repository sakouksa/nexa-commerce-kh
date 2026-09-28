<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
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
