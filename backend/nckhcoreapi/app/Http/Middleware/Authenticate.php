<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Authenticate extends JwtAuthMiddleware
{
    // Extends JwtAuthMiddleware to provide standard Authenticate naming
}
