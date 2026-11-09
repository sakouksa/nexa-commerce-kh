<?php

namespace App\Http\Middleware;

use App\Helpers\ShopHelper;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureShopAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $shopId = $request->route('shop_id') ?? $request->input('shop_id') ?? $request->attributes->get('shop_id');

        if ($shopId && $user) {
            ShopHelper::requireShopAccess((int) $shopId, $user);
        }

        return $next($request);
    }
}
