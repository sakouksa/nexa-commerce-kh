<?php

namespace App\Http\Middleware;

use App\Models\Customer;
use App\Models\User;
use App\Services\JwtService;
use Closure;
use Exception;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class JwtAuthMiddleware
{
    protected JwtService $jwtService;

    public function __construct(JwtService $jwtService)
    {
        $this->jwtService = $jwtService;
    }

    public function handle(Request $request, Closure $next): Response
    {
        $header = $request->header('Authorization', '');
        if (!str_starts_with($header, 'Bearer ')) {
            return response()->json(['detail' => 'Invalid or missing token'], 401);
        }

        $token = substr($header, 7);
        try {
            $payload = $this->jwtService->decodeToken($token);
        } catch (Exception $e) {
            return response()->json(['detail' => 'Invalid or expired token'], 401);
        }

        $role = $payload['role'] ?? null;
        $sub = $payload['sub'] ?? null;

        if (!$sub) {
            return response()->json(['detail' => 'Invalid token payload'], 401);
        }

        if ($role === 'customer') {
            $customer = Customer::find((int) $sub);
            if (!$customer) {
                return response()->json(['detail' => 'Customer not found'], 401);
            }
            $request->attributes->set('customer', $customer);
            $request->attributes->set('customer_id', $customer->id);
            $request->attributes->set('shop_id', $customer->shop_id);
        } else {
            $user = User::find((int) $sub);
            if (!$user) {
                return response()->json(['detail' => 'User not found'], 401);
            }
            if ($user->status !== 'active') {
                return response()->json(['detail' => 'Your account has been suspended'], 403);
            }
            $request->setUserResolver(fn() => $user);
        }

        return $next($request);
    }
}
