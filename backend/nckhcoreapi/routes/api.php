<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\TelegramController;
use App\Http\Controllers\UploadController;
use Illuminate\Support\Facades\Route;

// Health Check
Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

// ==================== AUTH ====================
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/login/oauth2', [AuthController::class, 'loginOauth2']);

    // Customer Telegram login
    Route::post('/telegram/login', [AuthController::class, 'telegramLogin']);
    Route::post('/telegram/mini/login', [AuthController::class, 'telegramMiniLogin']);
    Route::post('/telegram/request-code', [AuthController::class, 'requestTelegramCode']);
    Route::post('/telegram/verify-code', [AuthController::class, 'verifyTelegramCode']);
    Route::get('/telegram/me', [AuthController::class, 'telegramMe'])->middleware(['jwt.auth', 'role.customer']);

    // Authenticated user
    Route::middleware('jwt.auth')->group(function () {
        Route::post('/change-password', [AuthController::class, 'changePassword']);
        Route::get('/me', [AuthController::class, 'me']);

        // Admin only
        Route::middleware('role.admin')->group(function () {
            Route::post('/register', [AuthController::class, 'register']);
            Route::get('/users', [AuthController::class, 'listUsers']);
            Route::put('/users/{user_id}', [AuthController::class, 'updateUser']);
            Route::delete('/users/{user_id}', [AuthController::class, 'deleteUser']);
        });
    });
});

// ==================== SHOPS ====================
Route::prefix('shops')->group(function () {
    // Public shop endpoints
    Route::get('/public/{shop_id}', [ShopController::class, 'getByIdPublic'])->whereNumber('shop_id');
    Route::get('/{username}/qr', [ShopController::class, 'qrCode']);
    Route::get('/{username}/mini', [ShopController::class, 'getShopMini']);

    // Authenticated shop management
    Route::middleware('jwt.auth')->group(function () {
        Route::get('/{shop_id}', [ShopController::class, 'detail'])->whereNumber('shop_id');
        Route::get('/{shop_id}/detail', [ShopController::class, 'detail'])->whereNumber('shop_id');
        Route::get('/{shop_id}/owner', [ShopController::class, 'checkOwner'])->whereNumber('shop_id');
        Route::put('/{shop_id}', [ShopController::class, 'update'])->whereNumber('shop_id');
        Route::put('/{shop_id}/update', [ShopController::class, 'update'])->whereNumber('shop_id');

        // Admin only
        Route::middleware('role.admin')->group(function () {
            Route::get('', [ShopController::class, 'index']);
            Route::post('', [ShopController::class, 'store']);
            Route::put('/{shop_id}/status', [ShopController::class, 'toggleStatus'])->whereNumber('shop_id');
            Route::delete('/{shop_id}', [ShopController::class, 'destroy'])->whereNumber('shop_id');
            Route::match(['post', 'put'], '/{shop_id}/set-expiry', [ShopController::class, 'setExpiry'])->whereNumber('shop_id');
            Route::match(['post', 'put'], '/{shop_id}/expiry', [ShopController::class, 'setExpiry'])->whereNumber('shop_id');
            Route::match(['post', 'put'], '/{shop_id}/set-limits', [ShopController::class, 'setLimits'])->whereNumber('shop_id');
            Route::match(['post', 'put'], '/{shop_id}/limits', [ShopController::class, 'setLimits'])->whereNumber('shop_id');
        });
    });

    // Public lookup by username must come last to avoid capturing sub-paths
    Route::get('/{username}', [ShopController::class, 'getByUsername']);
});

// ==================== PRODUCTS ====================
Route::prefix('products')->group(function () {
    Route::get('/public', [ProductController::class, 'listPublic']);
    Route::get('/{product_id}/public', [ProductController::class, 'getPublic']);

    Route::middleware('jwt.auth')->group(function () {
        Route::get('', [ProductController::class, 'index']);
        Route::get('/{product_id}', [ProductController::class, 'show']);
        Route::post('', [ProductController::class, 'store']);
        Route::put('/{product_id}', [ProductController::class, 'update']);
        Route::post('/{product_id}/stock', [ProductController::class, 'updateStock']);
        Route::delete('/{product_id}', [ProductController::class, 'destroy']);
    });
});

// ==================== CATEGORIES ====================
Route::prefix('categories')->group(function () {
    Route::get('/public', [CategoryController::class, 'listPublic']);

    Route::middleware('jwt.auth')->group(function () {
        Route::get('', [CategoryController::class, 'index']);
        Route::post('', [CategoryController::class, 'store']);
        Route::put('/{category_id}', [CategoryController::class, 'update']);
        Route::delete('/{category_id}', [CategoryController::class, 'destroy']);
    });
});

// ==================== ORDERS ====================
Route::prefix('orders')->group(function () {
    // Public tracking & customer history
    Route::get('/public/track', [OrderController::class, 'trackOrder']);
    Route::post('/public/history', [OrderController::class, 'customerOrderHistory']);

    // Customer checkout (requires customer JWT)
    Route::post('', [OrderController::class, 'store'])->middleware(['jwt.auth', 'role.customer']);
    Route::get('/{order_id}/receipt', [OrderController::class, 'receipt']);

    Route::middleware('jwt.auth')->group(function () {
        Route::post('/pos', [OrderController::class, 'pos']);
        Route::get('', [OrderController::class, 'index']);
        Route::get('/all', [OrderController::class, 'listAllOrders'])->middleware('role.admin');
        Route::get('/{id_or_number}', [OrderController::class, 'show']);
        Route::put('/{id_or_number}/status', [OrderController::class, 'updateStatus']);
        Route::put('/{id_or_number}', [OrderController::class, 'update']);
        Route::delete('/{id_or_number}', [OrderController::class, 'destroy']);
    });
});

// ==================== CUSTOMERS ====================
Route::prefix('customers')->group(function () {
    Route::post('/auth/signup', [CustomerController::class, 'signup']);
    Route::post('/auth/signin', [CustomerController::class, 'signin']);
    Route::post('/history', [CustomerController::class, 'history']);

    // Customer profile management
    Route::middleware(['jwt.auth', 'role.customer'])->group(function () {
        Route::get('/auth/me', [CustomerController::class, 'me']);
        Route::put('/auth/me', [CustomerController::class, 'updateMe']);
        Route::post('/auth/change-password', [CustomerController::class, 'changePassword']);
        Route::get('/auth/orders', [CustomerController::class, 'customerMyOrders']);
    });

    // Shop owner & admin management
    Route::middleware('jwt.auth')->group(function () {
        Route::get('', [CustomerController::class, 'index']);
        Route::get('/{customer_id}', [CustomerController::class, 'getCustomer']);
        Route::post('', [CustomerController::class, 'store']);
        Route::put('/{customer_id}', [CustomerController::class, 'update']);
        Route::delete('/{customer_id}', [CustomerController::class, 'destroy']);
    });
});

// ==================== PAYMENTS ====================
Route::prefix('payments')->group(function () {
    Route::get('/aba/status', [PaymentController::class, 'abaStatus']);
    Route::post('/aba/create', [PaymentController::class, 'abaCreate']);
    Route::post('/aba/verify', [PaymentController::class, 'abaVerify']);
    Route::post('/aba/webhook', [PaymentController::class, 'abaWebhook']);
    Route::post('/aba/callback', [PaymentController::class, 'abaCallback']);
    Route::get('/aba/success', [PaymentController::class, 'abaSuccess']);
    Route::get('/aba/error', [PaymentController::class, 'abaError']);

    Route::post('/aba/test', [PaymentController::class, 'abaTest'])->middleware('jwt.auth');
});

// ==================== PLANS & RESELLERS ====================
Route::prefix('plans')->group(function () {
    Route::get('', [PlanController::class, 'listPlans']);
    Route::post('/register', [PlanController::class, 'registerShopPlan']);
    Route::post('/confirm', [PlanController::class, 'confirmPlan']);
    Route::post('/upgrade', [PlanController::class, 'upgradePlan']);
    Route::get('/shop/{shop_id}', [PlanController::class, 'shopPlan']);

    Route::middleware('jwt.auth')->group(function () {
        Route::get('/reseller/me', [PlanController::class, 'resellerMe']);
        Route::post('/reseller/promo', [PlanController::class, 'resellerPromo']);
        Route::get('/reseller/export', [PlanController::class, 'resellerExport']);
        Route::post('/reseller/import', [PlanController::class, 'resellerImport']);

        Route::middleware('role.admin')->group(function () {
            Route::get('/charts', [PlanController::class, 'platformCharts']);
            Route::get('/resellers', [PlanController::class, 'listResellers']);
            Route::post('/resellers', [PlanController::class, 'createReseller']);
            Route::get('/resellers/{reseller_id}/customers', [PlanController::class, 'resellerCustomers']);
            Route::get('/resellers/{reseller_id}', [PlanController::class, 'getReseller']);
            Route::put('/resellers/{reseller_id}', [PlanController::class, 'updateReseller']);
            Route::delete('/resellers/{reseller_id}', [PlanController::class, 'deleteReseller']);
        });
    });
});

// ==================== REPORTS ====================
Route::prefix('reports')->middleware('jwt.auth')->group(function () {
    Route::get('/sales', [ReportController::class, 'sales']);
    Route::get('/overview', [ReportController::class, 'overview']);
    Route::get('/products', [ReportController::class, 'products']);
    Route::get('/customers', [ReportController::class, 'customers']);
    Route::get('/stock', [ReportController::class, 'stock']);
    Route::get('/sales/export', [ReportController::class, 'salesExport']);
    Route::get('/telegram/summary', [ReportController::class, 'telegramSummary']);
    Route::post('/telegram/dispatch', [ReportController::class, 'telegramDispatch']);
});

// ==================== SETTINGS ====================
Route::prefix('settings')->middleware('jwt.auth')->group(function () {
    Route::get('', [SettingController::class, 'index']);
    Route::post('', [SettingController::class, 'update']);
    Route::get('/platform', [SettingController::class, 'platform']);
    Route::get('/stats', [SettingController::class, 'stats']);
    Route::get('/activity', [TelegramController::class, 'listActivity']);
});

// ==================== UPLOADS ====================
Route::prefix('uploads')->middleware('jwt.auth')->group(function () {
    Route::post('', [UploadController::class, 'upload']);
    Route::post('/product', [UploadController::class, 'uploadProduct']);
});

// ==================== TELEGRAM ====================
Route::prefix('telegram')->group(function () {
    Route::post('/webhook/{token}', [TelegramController::class, 'webhook']);

    Route::middleware('jwt.auth')->group(function () {
        Route::post('/test', [TelegramController::class, 'test']);
        Route::post('/setwebhook', [TelegramController::class, 'setWebhook']);
        Route::get('/settings', [TelegramController::class, 'settings']);
        Route::post('/stock-alert', [TelegramController::class, 'sendStockAlert']);
        Route::get('/logs', [TelegramController::class, 'logs']);
        Route::get('/profile/{shop_id}', [TelegramController::class, 'profile']);
        Route::post('/link-chat', [TelegramController::class, 'linkChat']);
        Route::post('/unlink-chat', [TelegramController::class, 'unlinkChat']);
    });
});

// ==================== ACTIVITY ====================
Route::get('/activity', [TelegramController::class, 'listActivity'])->middleware('jwt.auth');

// ==================== BACKUP ====================
Route::prefix('backup')->middleware('jwt.auth')->group(function () {
    Route::get('/export', [BackupController::class, 'adminExport'])->middleware('role.admin');
    Route::get('/admin/export', [BackupController::class, 'adminExport'])->middleware('role.admin');
    Route::get('/shop/{shop_id}/export', [BackupController::class, 'shopExport']);
    Route::post('/shop/{shop_id}/create', [BackupController::class, 'createShopBackup']);
    Route::post('/shop/{shop_id}/import', [BackupController::class, 'importShopBackup']);
    Route::post('/admin/create', [BackupController::class, 'createSystemBackup'])->middleware('role.admin');
    Route::post('/admin/import', [BackupController::class, 'adminImport'])->middleware('role.admin');
    Route::get('/history', [BackupController::class, 'history']);
    Route::get('/download', [BackupController::class, 'downloadBackup']);
    Route::delete('/history/{backup_id}', [BackupController::class, 'deleteHistory']);
    Route::get('/history/{backup_id}/download', [BackupController::class, 'downloadHistory']);
});
