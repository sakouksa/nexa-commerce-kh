<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'user_id',
        'username',
        'action',
        'description',
        'ip_address',
        'user_agent',
        'method',
        'url',
        'status',
        'properties',
    ];

    protected function casts(): array
    {
        return [
            'shop_id' => 'integer',
            'user_id' => 'integer',
            'properties' => 'array',
        ];
    }

    public function to_dict(): array
    {
        return [
            'id' => $this->id,
            'shop_id' => $this->shop_id,
            'user_id' => $this->user_id,
            'username' => $this->username ?? '',
            'action' => $this->action ?? '',
            'description' => $this->description ?? '',
            'ip_address' => $this->ip_address ?? '',
            'user_agent' => $this->user_agent ?? '',
            'method' => $this->method ?? '',
            'url' => $this->url ?? '',
            'status' => $this->status ?? 'success',
            'properties' => $this->properties ?? null,
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null,
        ];
    }
}
