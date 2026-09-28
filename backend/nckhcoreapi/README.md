# Mini Shop Cambodia — Laravel Backend API

A complete, production-ready Laravel 13 backend porting all business logic from the original FastAPI backend for the Mini Shop multi-tenant platform.

## Features & Parity
- **Full API Parity**: Preserves exact endpoint routes (`/api/*`), request payloads, query parameters, and response structures.
- **FastAPI Error Compatibility**: All validation errors, 401s, 403s, 404s, and 429s format exceptions as `{"detail": "..."}` so that existing frontend Axios interceptors (`err.response.data.detail`) function seamlessly.
- **Multi-tenant Architecture**: Per-shop scoping for products, categories, orders, customers, settings, and activity logs.
- **Security & Lockout**:
  - JWT authentication (`firebase/php-jwt`) with HS256 algorithm.
  - Escalating failed login lockout (3 attempts -> 5 min, 10 min, 15 min...) with rate limiting.
- **Cambodia Payments**: ABA Pay KHQR generation, direct QR API, check-transaction verification, and webhook callbacks.
- **Telegram Notifications & Bot Auth**: HMAC-SHA256 login widget validation, link-chat pairing codes, and HTML customer order notifications.
- **PDF Receipts**: Barryvdh DomPDF receipt generation with custom layout (`/api/orders/{id}/receipt`).
- **QR Codes**: BaconQrCode generation with centered logo overlay (`/api/shops/{username}/qr`).
- **Data Export / Backup**: Backup and restore via ZIP/JSON and Excel spreadsheets (`phpoffice/phpspreadsheet`).

## Installation & Setup

```bash
cd Backend_API

# Install Composer dependencies (already completed)
composer install

# Environment configuration
cp .env.example .env
php artisan key:generate

# Database migration & demo data seed
php artisan migrate --force
php artisan db:seed

# Generate demo image placeholders
php generate_demo_images.php

# Run development server on port 8000
php artisan serve --port=8000
```

## Running Tests

Run the automated PHPUnit feature tests to verify API compatibility across all modules:

```bash
php artisan test
```

## Default Accounts
- **Platform Super Admin**:
  - Username: `admin`
  - Password: `admin123`
- **Demo Shop Owner**:
  - Username: `demo`
  - Password: `demo123`
  - Shop Slug: `demo` (`http://localhost:8000/api/shops/demo`)
