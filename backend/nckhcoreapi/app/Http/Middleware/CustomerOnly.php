<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CustomerOnly
{
    public function handle(Request $request, Closure $next): Response
    {
        $customer = $request->attributes->get('customer');
        if (!$customer) {
            return response()->json(['detail' => 'Please login with Telegram to continue'], 401);
        }

        return $next($request);
    }
}
