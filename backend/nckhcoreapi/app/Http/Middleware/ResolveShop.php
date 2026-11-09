<?php

namespace App\Http\Middleware;

use App\Models\Shop;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveShop
{
    public function handle(Request $request, Closure $next): Response
    {
        $shopId = $request->route('shop_id') ?? $request->input('shop_id');
        $username = $request->route('username') ?? $request->input('shop_username');

        if ($shopId) {
            $shop = Shop::find($shopId);
            if ($shop) {
                $request->attributes->set('shop', $shop);
                $request->attributes->set('shop_id', $shop->id);
            }
        } elseif ($username) {
            $shop = Shop::where('username', $username)->first();
            if ($shop) {
                $request->attributes->set('shop', $shop);
                $request->attributes->set('shop_id', $shop->id);
            }
        }

        return $next($request);
    }
}
