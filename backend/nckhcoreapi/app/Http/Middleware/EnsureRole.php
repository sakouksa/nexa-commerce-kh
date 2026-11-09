<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            $customer = $request->attributes->get('customer');
            if ($customer && in_array('customer', $roles)) {
                return $next($request);
            }
            return response()->json(['detail' => 'Unauthorized'], 401);
        }

        if (!empty($roles) && !in_array($user->role, $roles) && $user->role !== 'admin') {
            return response()->json(['detail' => 'Forbidden'], 403);
        }

        return $next($request);
    }
}
