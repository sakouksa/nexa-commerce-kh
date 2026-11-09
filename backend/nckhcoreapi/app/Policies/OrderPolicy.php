<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'shop']);
    }

    public function view(User $user, Order $order): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'shop') {
            return (int) $user->shop_id === (int) $order->shop_id;
        }

        return false;
    }

    public function create(?User $user): bool
    {
        return true; // Anyone or guest can create order
    }

    public function update(User $user, Order $order): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return (int) $user->shop_id === (int) $order->shop_id;
    }

    public function delete(User $user, Order $order): bool
    {
        return $user->role === 'admin';
    }
}
