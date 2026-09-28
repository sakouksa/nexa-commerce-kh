<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BackupHistory extends Model
{
    use HasFactory;

    protected $table = 'backup_history';

    protected $fillable = [
        'shop_id',
        'filename',
        'filepath',
        'kind',
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
            'filename' => $this->filename ?? '',
            'filepath' => $this->filepath ?? '',
            'kind' => $this->kind ?? 'shop',
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null,
        ];
    }
}
