<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Product $product): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'shop']);
    }

    public function update(User $user, Product $product): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return (int) $user->shop_id === (int) $product->shop_id;
    }

    public function delete(User $user, Product $product): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return (int) $user->shop_id === (int) $product->shop_id;
    }
}
