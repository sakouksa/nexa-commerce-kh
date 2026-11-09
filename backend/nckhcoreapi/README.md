# Mini Shop Cambodia — Laravel Backend API (NCKHCoreAPI)

A complete, production-ready, Domain-Driven Laravel backend for the Mini Shop Cambodia multi-tenant eCommerce platform.

## Project Structure (`backend/nckhcoreapi/`)

```text
backend/nckhcoreapi/
│
├── app/
│   │
│   ├── Actions/
│   │   ├── Auth/
│   │   │   ├── LoginAction.php
│   │   │   ├── RegisterAction.php
│   │   │   └── LogoutAction.php
│   │   │
│   │   ├── Shops/
│   │   │   ├── CreateShopAction.php
│   │   │   ├── UpdateShopAction.php
│   │   │   └── SwitchShopAction.php
│   │   │
│   │   ├── Products/
│   │   │   ├── CreateProductAction.php
│   │   │   ├── UpdateProductAction.php
│   │   │   └── DeleteProductAction.php
│   │   │
│   │   ├── Orders/
│   │   │   ├── CreateOrderAction.php
│   │   │   ├── ProcessPosOrderAction.php
│   │   │   ├── CancelOrderAction.php
│   │   │   └── CompleteOrderAction.php
│   │   │
│   │   ├── Payments/
│   │   │   ├── CreatePaymentAction.php
│   │   │   ├── VerifyPaymentAction.php
│   │   │   └── RefundPaymentAction.php
│   │   │
│   │   └── Inventory/
│   │       ├── AdjustStockAction.php
│   │       ├── ReserveStockAction.php
│   │       └── ReleaseStockAction.php
│   │
│   ├── Enums/
│   │   ├── UserRole.php
│   │   ├── ShopStatus.php
│   │   ├── ProductStatus.php
│   │   ├── OrderStatus.php
│   │   ├── PaymentStatus.php
│   │   ├── PaymentMethod.php
│   │   └── StockMovementType.php
│   │
│   ├── Events/
│   │   ├── OrderCreated.php
│   │   ├── OrderPaid.php
│   │   ├── OrderCompleted.php
│   │   ├── PaymentVerified.php
│   │   └── LowStockDetected.php
│   │
│   ├── Listeners/
│   │   ├── SendOrderTelegramNotification.php
│   │   ├── SendPaymentNotification.php
│   │   └── NotifyLowStock.php
│   │
│   ├── Exceptions/
│   │   ├── OrderException.php
│   │   ├── PaymentException.php
│   │   ├── StockException.php
│   │   └── ShopAccessException.php
│   │
│   ├── Http/
│   │   │
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── Auth/
│   │   │   │   │   ├── AuthController.php
│   │   │   │   │   └── ProfileController.php
│   │   │   │   │
│   │   │   │   ├── Admin/
│   │   │   │   │   ├── DashboardController.php
│   │   │   │   │   ├── ShopController.php
│   │   │   │   │   └── UserController.php
│   │   │   │   │
│   │   │   │   ├── Shop/
│   │   │   │   │   ├── ShopController.php
│   │   │   │   │   └── ShopSettingsController.php
│   │   │   │   │
│   │   │   │   ├── Products/
│   │   │   │   │   ├── ProductController.php
│   │   │   │   │   └── CategoryController.php
│   │   │   │   │
│   │   │   │   ├── Orders/
│   │   │   │   │   ├── OrderController.php
│   │   │   │   │   └── PosOrderController.php
│   │   │   │   │
│   │   │   │   ├── Payments/
│   │   │   │   │   ├── PaymentController.php
│   │   │   │   │   └── PaymentWebhookController.php
│   │   │   │   │
│   │   │   │   ├── Inventory/
│   │   │   │   │   ├── StockController.php
│   │   │   │   │   └── StockMovementController.php
│   │   │   │   │
│   │   │   │   ├── Customers/
│   │   │   │   │   └── CustomerController.php
│   │   │   │   │
│   │   │   │   ├── Reports/
│   │   │   │   │   ├── SalesReportController.php
│   │   │   │   │   ├── ProductReportController.php
│   │   │   │   │   └── InventoryReportController.php
│   │   │   │   │
│   │   │   │   └── Telegram/
│   │   │   │       ├── TelegramAuthController.php
│   │   │   │       └── TelegramWebhookController.php
│   │   │   │
│   │   │   └── Controller.php
│   │   │
│   │   ├── Middleware/
│   │   │   ├── Authenticate.php
│   │   │   ├── EnsureShopAccess.php
│   │   │   ├── EnsureRole.php
│   │   │   └── ResolveShop.php
│   │   │
│   │   ├── Requests/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginRequest.php
│   │   │   │   └── RegisterRequest.php
│   │   │   │
│   │   │   ├── Shops/
│   │   │   │   ├── StoreShopRequest.php
│   │   │   │   └── UpdateShopRequest.php
│   │   │   │
│   │   │   ├── Products/
│   │   │   │   ├── StoreProductRequest.php
│   │   │   │   └── UpdateProductRequest.php
│   │   │   │
│   │   │   ├── Orders/
│   │   │   │   ├── StoreOrderRequest.php
│   │   │   │   └── StorePosOrderRequest.php
│   │   │   │
│   │   │   ├── Payments/
│   │   │   │   └── VerifyPaymentRequest.php
│   │   │   │
│   │   │   └── Inventory/
│   │   │       └── AdjustStockRequest.php
│   │   │
│   │   └── Resources/
│   │       ├── UserResource.php
│   │       ├── ShopResource.php
│   │       ├── ProductResource.php
│   │       ├── CategoryResource.php
│   │       ├── OrderResource.php
│   │       ├── OrderItemResource.php
│   │       ├── PaymentResource.php
│   │       ├── StockResource.php
│   │       └── CustomerResource.php
│   │
│   ├── Models/
│   │   ├── User.php
│   │   ├── Shop.php
│   │   ├── ShopSetting.php
│   │   ├── Category.php
│   │   ├── Product.php
│   │   ├── ProductImage.php
│   │   ├── Customer.php
│   │   ├── Order.php
│   │   ├── OrderItem.php
│   │   ├── Payment.php
│   │   ├── Stock.php
│   │   └── StockMovement.php
│   │
│   ├── Repositories/
│   │   ├── Contracts/
│   │   │   ├── OrderRepositoryInterface.php
│   │   │   └── ProductRepositoryInterface.php
│   │   │
│   │   └── Eloquent/
│   │       ├── OrderRepository.php
│   │       └── ProductRepository.php
│   │
│   ├── Services/
│   │   ├── Payment/
│   │   │   ├── PaymentService.php
│   │   │   ├── AbaPayService.php
│   │   │   └── KhqrService.php
│   │   │
│   │   ├── Telegram/
│   │   │   ├── TelegramBotService.php
│   │   │   └── TelegramMiniAppService.php
│   │   │
│   │   ├── Inventory/
│   │   │   └── StockService.php
│   │   │
│   │   ├── Documents/
│   │   │   ├── PdfReceiptService.php
│   │   │   └── QrCodeService.php
│   │   │
│   │   └── Auth/
│   │       └── JwtService.php
│   │
│   ├── Policies/
│   │   ├── ShopPolicy.php
│   │   ├── ProductPolicy.php
│   │   ├── OrderPolicy.php
│   │   └── UserPolicy.php
│   │
│   ├── Scopes/
│   │   └── ShopScope.php
│   │
│   ├── Traits/
│   │   └── ApiResponseTrait.php
│   │
│   ├── Providers/
│   │   ├── AppServiceProvider.php
│   │   └── RepositoryServiceProvider.php
│   │
│   └── Support/
│       ├── Money/
│       │   └── Money.php
│       ├── Pagination/
│       │   └── PaginationHelper.php
│       └── Api/
│           └── ApiResponse.php
│
├── bootstrap/
│   ├── app.php
│   └── providers.php
│
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── database.php
│   ├── filesystems.php
│   ├── logging.php
│   ├── queue.php
│   ├── services.php
│   ├── payment.php
│   └── telegram.php
│
├── database/
│   ├── factories/
│   │   ├── UserFactory.php
│   │   ├── ShopFactory.php
│   │   ├── ProductFactory.php
│   │   └── OrderFactory.php
│   │
│   ├── migrations/
│   │   ├── 0001_01_01_000000_create_users_table.php
│   │   ├── 0001_01_01_000001_create_cache_table.php
│   │   ├── 0001_01_01_000002_create_jobs_table.php
│   │   ├── 0001_01_01_000003_create_minishop_tables.php
│   │   └── 2026_09_16_043331_create_personal_access_tokens_table.php
│   │
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── UserSeeder.php
│       ├── ShopSeeder.php
│       ├── CategorySeeder.php
│       └── ProductSeeder.php
│
├── routes/
│   ├── api.php
│   ├── web.php
│   └── console.php
│
├── storage/
│   ├── app/
│   ├── framework/
│   └── logs/
│
├── tests/
│   ├── Feature/
│   │   ├── Auth/
│   │   ├── Shops/
│   │   ├── Products/
│   │   ├── Orders/
│   │   ├── Payments/
│   │   ├── Inventory/
│   │   └── Telegram/
│   │
│   └── Unit/
│       ├── Actions/
│       ├── Services/
│       └── Repositories/
│
├── .env
├── .env.example
├── .gitignore
├── artisan
├── composer.json
├── phpunit.xml
└── README.md
```

## Features & Parity
- **Full API Parity**: Preserves exact endpoint routes (`/api/*`), request payloads, query parameters, and response structures.
- **FastAPI Error Compatibility**: All validation errors, 401s, 403s, 404s, and 429s format exceptions as `{"detail": "..."}` so that existing frontend Axios interceptors function seamlessly.
- **Multi-tenant Architecture**: Per-shop scoping for products, categories, orders, customers, settings, and activity logs via `ShopScope` / `TenantScope`.
- **Security & Lockout**: JWT authentication (`firebase/php-jwt`) with HS256 algorithm and failed login lockouts.
- **Cambodia Payments**: ABA Pay KHQR generation, direct QR API, check-transaction verification, and webhook callbacks.
- **Telegram Notifications & Bot Auth**: HMAC-SHA256 login widget validation, link-chat pairing codes, and HTML customer order notifications.
- **PDF Receipts**: Barryvdh DomPDF receipt generation with custom layout (`/api/orders/{id}/receipt`).
- **QR Codes**: BaconQrCode generation with centered logo overlay (`/api/shops/{username}/qr`).

## Running Tests

```bash
php artisan test
```
