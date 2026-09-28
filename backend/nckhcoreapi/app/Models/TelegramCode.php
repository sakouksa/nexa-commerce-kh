<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TelegramCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'telegram_id',
        'code_hash',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'shop_id' => 'integer',
            'telegram_id' => 'integer',
            'expires_at' => 'datetime',
        ];
    }
}
