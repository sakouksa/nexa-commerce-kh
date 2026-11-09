<?php

namespace App\Repositories\Contracts;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface ProductRepositoryInterface extends BaseRepositoryInterface
{
    public function getByShop(int $shopId, array $filters = []): LengthAwarePaginator;

    public function getPublicActive(int $shopId, array $filters = []): Collection;

    public function findByIdAndShop(int $id, int $shopId): ?Product;

    public function lockForUpdate(int $id): ?Product;

    public function updateQuantity(int $id, int $quantity): bool;
}
