<?php

namespace App\Http\Middleware;

use App\Models\Customer;
use App\Models\User;
use App\Services\JwtService;
use Closure;
use Exception;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

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
        if (! str_starts_with($header, 'Bearer ')) {
            throw new AuthenticationException('Invalid or missing token');
        }

        $token = substr($header, 7);
        try {
            $payload = $this->jwtService->decodeToken($token);
        } catch (Exception $e) {
            throw new AuthenticationException('Invalid or expired token');
        }

        $role = $payload['role'] ?? null;
        $sub = $payload['sub'] ?? null;

        if (! $sub) {
            throw new AuthenticationException('Invalid token payload');
        }

        if ($role === 'customer') {
            $customer = Customer::find((int) $sub);
            if (! $customer) {
                throw new AuthenticationException('Customer not found');
            }
            $request->attributes->set('customer', $customer);
            $request->attributes->set('customer_id', $customer->id);
            $request->attributes->set('shop_id', $customer->shop_id);
        } else {
            $user = User::find((int) $sub);
            if (! $user) {
                throw new AuthenticationException('User not found');
            }
            if ($user->status !== 'active') {
                throw new HttpException(403, 'Your account has been suspended');
            }
            $request->setUserResolver(fn () => $user);
            $request->attributes->set('user_id', $user->id);
            if ($user->shop_id !== null) {
                $request->attributes->set('shop_id', $user->shop_id);
            }
        }

        return $next($request);
    }
}
