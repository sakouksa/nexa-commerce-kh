<?php

namespace App\Repositories\Eloquent;

use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ProductRepository extends BaseRepository implements ProductRepositoryInterface
{
    public function __construct(Product $model)
    {
        parent::__construct($model);
    }

    public function getByShop(int $shopId, array $filters = []): LengthAwarePaginator
    {
        return $this->model->newQuery()
            ->with('category')
            ->where('shop_id', $shopId)
            ->when($filters['category_id'] ?? null, fn ($q, $catId) => $q->where('category_id', $catId))
            ->when($filters['search'] ?? null, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderByDesc('id')
            ->paginate($filters['per_page'] ?? 20);
    }

    public function getPublicActive(int $shopId, array $filters = []): Collection
    {
        return $this->model->newQuery()
            ->with('category')
            ->where('shop_id', $shopId)
            ->where('status', 'active')
            ->when($filters['category_id'] ?? null, fn ($q, $catId) => $q->where('category_id', $catId))
            ->when($filters['search'] ?? null, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when(! empty($filters['featured_only']), fn ($q) => $q->where('featured', true))
            ->get();
    }

    public function findByIdAndShop(int $id, int $shopId): ?Product
    {
        return $this->model->newQuery()
            ->where('id', $id)
            ->where('shop_id', $shopId)
            ->first();
    }

    public function lockForUpdate(int $id): ?Product
    {
        return $this->model->newQuery()
            ->where('id', $id)
            ->lockForUpdate()
            ->first();
    }

    public function updateQuantity(int $id, int $quantity): bool
    {
        return $this->model->newQuery()
            ->where('id', $id)
            ->update(['quantity' => $quantity]) > 0;
    }
}
