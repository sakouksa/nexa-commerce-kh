<?php

namespace App\Repositories\Eloquent;

use App\Models\Order;
use App\Repositories\Contracts\OrderRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class OrderRepository extends BaseRepository implements OrderRepositoryInterface
{
    public function __construct(Order $model)
    {
        parent::__construct($model);
    }

    public function getByShop(int $shopId, array $filters = []): Collection
    {
        $query = $this->model->newQuery()
            ->with('items')
            ->where('shop_id', $shopId);

        if (! empty($filters['status'])) {
            $query->where('order_status', $filters['status']);
        }
        if (! empty($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }
        if (! empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }
        if (! empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }
        if (! empty($filters['search'])) {
            $s = trim($filters['search']);
            $query->where(function ($q) use ($s) {
                $q->where('order_number', 'like', "%{$s}%")
                    ->orWhere('customer_name', 'like', "%{$s}%")
                    ->orWhere('customer_phone', 'like', "%{$s}%");
            });
        }

        return $query->orderByDesc('id')->get();
    }

    public function findWithItems(int|string $idOrNumber): ?Order
    {
        return is_numeric($idOrNumber)
            ? $this->model->newQuery()->with('items')->find((int) $idOrNumber)
            : $this->model->newQuery()->with('items')->where('order_number', $idOrNumber)->first();
    }

    public function findByOrderNumber(string $orderNumber): ?Order
    {
        return $this->model->newQuery()->where('order_number', $orderNumber)->first();
    }

    public function getCustomerOrders(int $shopId, int $customerId, ?string $phone = null): Collection
    {
        return $this->model->newQuery()
            ->with('items')
            ->where('shop_id', $shopId)
            ->where(function ($q) use ($customerId, $phone) {
                $q->where('customer_id', $customerId);
                if (! empty($phone)) {
                    $q->orWhere('customer_phone', $phone);
                }
            })
            ->orderByDesc('id')
            ->get();
    }
}
