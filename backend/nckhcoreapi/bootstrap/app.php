<?php

use App\Exceptions\ApiExceptionHandler;
use App\Http\Middleware\AdminOnly;
use App\Http\Middleware\AssignRequestId;
use App\Http\Middleware\CustomerOnly;
use App\Http\Middleware\JwtAuthMiddleware;
use App\Http\Middleware\ShopUserOnly;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(AssignRequestId::class);

        $middleware->alias([
            'jwt.auth' => JwtAuthMiddleware::class,
            'role.admin' => AdminOnly::class,
            'role.shop' => ShopUserOnly::class,
            'role.customer' => CustomerOnly::class,
            'auth.jwt' => \App\Http\Middleware\Authenticate::class,
            'shop.access' => \App\Http\Middleware\EnsureShopAccess::class,
            'role' => \App\Http\Middleware\EnsureRole::class,
            'shop.resolve' => \App\Http\Middleware\ResolveShop::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(function (Throwable $e, Request $request) {
            return ApiExceptionHandler::render($e, $request);
        });
    })->create();
