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
    ];

    protected function casts(): array
    {
        return [
            'shop_id' => 'integer',
            'user_id' => 'integer',
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
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null,
        ];
    }
}
