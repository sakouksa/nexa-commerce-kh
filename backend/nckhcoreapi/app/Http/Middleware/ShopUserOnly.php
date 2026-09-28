<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ShopUserOnly
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['shop_owner', 'staff', 'admin'])) {
            return response()->json(['detail' => 'Shop account required'], 403);
        }

        return $next($request);
    }
}
