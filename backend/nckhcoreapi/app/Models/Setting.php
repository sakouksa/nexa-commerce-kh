<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

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
