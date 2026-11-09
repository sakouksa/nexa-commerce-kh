<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default Telegram Bot Token & Credentials
    |--------------------------------------------------------------------------
    |
    | Used for the default platform bot (or fallback when token is not provided
    | in multi-tenant per-shop webhook requests).
    |
    */
    'bot_token' => env('TELEGRAM_BOT_TOKEN', ''),
    'bot_username' => env('TELEGRAM_BOT_USERNAME', ''),

    /*
    |--------------------------------------------------------------------------
    | Telegram API Base URL
    |--------------------------------------------------------------------------
    */
    'api_url' => env('TELEGRAM_API_URL', 'https://api.telegram.org'),

    /*
    |--------------------------------------------------------------------------
    | Webhook Configuration
    |--------------------------------------------------------------------------
    */
    'webhook_url' => env('TELEGRAM_WEBHOOK_URL', ''),
    'webhook_secret' => env('TELEGRAM_WEBHOOK_SECRET', ''),

    /*
    |--------------------------------------------------------------------------
    | Polling Worker Settings
    |--------------------------------------------------------------------------
    */
    'poll_interval' => (float) env('TELEGRAM_POLL_INTERVAL', env('LOOP_SECONDS', 0.5)),
    'request_timeout' => (int) env('TELEGRAM_REQUEST_TIMEOUT', 30),

    /*
    |--------------------------------------------------------------------------
    | Storefront & Mini App Integration
    |--------------------------------------------------------------------------
    */
    'mini_app_url' => env('TELEGRAM_MINI_APP_URL', 'http://localhost:3006'),
    'default_welcome_message' => env(
        'TELEGRAM_WELCOME_MESSAGE',
        'សូមស្វាគមន៍មកកាន់ប្រព័ន្ធ Telegram Bot របស់ Nexa Commerce KH! 🏪'
    ),
];
