<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShopSetting extends Model
{
    use HasFactory;

    protected $table = 'settings';

    protected $fillable = [
        'shop_id',
        'key',
        'value',
    ];

    protected function casts(): array
    {
        return [
            'shop_id' => 'integer',
        ];
    }

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function to_dict(): array
    {
        return [
            'id' => $this->id,
            'shop_id' => $this->shop_id,
            'key' => $this->key,
            'value' => $this->value ?? '',
        ];
    }
}
