<?php

namespace App\Policies;

use App\Models\Shop;
use App\Models\User;

class ShopPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function view(User $user, Shop $shop): bool
    {
        return $user->role === 'admin' || (int) $user->shop_id === (int) $shop->id;
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, Shop $shop): bool
    {
        return $user->role === 'admin' || (int) $user->shop_id === (int) $shop->id;
    }

    public function delete(User $user, Shop $shop): bool
    {
        return $user->role === 'admin';
    }
}
