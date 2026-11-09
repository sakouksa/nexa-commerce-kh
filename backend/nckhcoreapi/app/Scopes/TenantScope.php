<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TenantScope implements Scope
{
    public function __construct(
        protected ?int $shopId = null
    ) {}

    public function apply(Builder $builder, Model $model): void
    {
        $user = request()->user();
        if ($this->shopId !== null) {
            $shopId = $this->shopId;
        } elseif ($user && $user->role !== 'admin' && $user->shop_id) {
            $shopId = $user->shop_id;
        } else {
            $shopId = request()->attributes->get('shop_id') ?? request()->input('shop_id');
        }

        if ($shopId) {
            $builder->where($model->getTable().'.shop_id', (int) $shopId);
        }
    }
}
