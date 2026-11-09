<?php

namespace App\Repositories\Contracts;

use App\Models\Order;
use Illuminate\Database\Eloquent\Collection;

interface OrderRepositoryInterface extends BaseRepositoryInterface
{
    public function getByShop(int $shopId, array $filters = []): Collection;

    public function findWithItems(int|string $idOrNumber): ?Order;

    public function findByOrderNumber(string $orderNumber): ?Order;

    public function getCustomerOrders(int $shopId, int $customerId, ?string $phone = null): Collection;
}
