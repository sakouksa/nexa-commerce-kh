<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'name',
        'slug',
        'parent_id',
        'image',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'shop_id' => 'integer',
            'parent_id' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class, 'shop_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'category_id');
    }

    public function to_dict(): array
    {
        return [
            'id' => $this->id,
            'shop_id' => $this->shop_id,
            'name' => $this->name,
            'slug' => $this->slug ?? '',
            'parent_id' => $this->parent_id,
            'image' => $this->image ?? '',
            'sort_order' => (int) ($this->sort_order ?? 0),
        ];
    }
}
