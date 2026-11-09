<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Core REST API Connection
    |--------------------------------------------------------------------------
    |
    | Base URL of the backend/nckhcoreapi service running in the ecosystem.
    |
    */
    'base_url' => rtrim(env('CORE_API_BASE_URL', env('MINI_BACKEND_BASE_URL', 'http://localhost:8003')), '/'),

    /*
    |--------------------------------------------------------------------------
    | Secret Service Key
    |--------------------------------------------------------------------------
    |
    | Optional shared secret token sent via X-Bot-Service-Key header to access
    | protected bot configuration or internal linking endpoints.
    |
    */
    'service_key' => env('CORE_API_SERVICE_KEY', env('MINI_BOT_SERVICE_KEY', '')),

    /*
    |--------------------------------------------------------------------------
    | HTTP Client Timeouts & Retries
    |--------------------------------------------------------------------------
    */
    'timeout' => (int) env('CORE_API_TIMEOUT', 20),
    'retry_attempts' => (int) env('CORE_API_RETRY_ATTEMPTS', 3),
];
