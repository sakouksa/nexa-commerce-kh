<?php

return [
    'default' => env('PAYMENT_DEFAULT_GATEWAY', 'aba_pay'),

    'currency' => env('PAYMENT_CURRENCY', 'USD'),

    'aba' => [
        'base_url' => env('ABA_PAYWAY_BASE_URL', 'https://khqr.cc/api'),
        'merchant_id' => env('ABA_PAYWAY_MERCHANT_ID', ''),
        'api_key' => env('ABA_PAYWAY_API_KEY', ''),
        'callback_url' => env('ABA_PAYWAY_CALLBACK_URL', ''),
    ],

    'bakong_khqr' => [
        'base_url' => env('BAKONG_KHQR_BASE_URL', 'https://api-bakong.nbc.gov.kh/v1'),
        'merchant_id' => env('BAKONG_MERCHANT_ID', ''),
        'token' => env('BAKONG_KHQR_TOKEN', ''),
    ],
];
