# Nexa Commerce KH - Telegram Bot Service (Laravel) 🏪🤖

> **ប្រព័ន្ធ Telegram Bot សេវាកម្មផ្លូវការរបស់ Nexa Commerce KH (MiniStoreKH)**  
> ត្រូវបានអភិវឌ្ឍឡើងវិញទាំងស្រុងដោយប្រើ **Laravel (PHP 8.3+)** ជំនួស Python Worker ចាស់ ដើម្បីបង្កើនល្បឿន ភាពងាយស្រួលក្នុងការគ្រប់គ្រង និងស្ថាបត្យកម្មស្អាត (Clean Architecture)។

---

## 📑 តារាងមាតិកា (Table of Contents)

1. [ទិដ្ឋភាពទូទៅ (Overview)](#1-ទិដ្ឋភាពទូទៅ-overview)
2. [រចនាសម្ព័ន្ធគម្រោង (Directory Structure)](#2-រចនាសម្ព័ន្ធគម្រោង-directory-structure)
3. [ការដំឡើង និងដំណើរការ (Installation & Setup)](#3-ការដំឡើង-និងដំណើរការ-installation--setup)
4. [របៀបដំណើរការ Bot (Running the Bot)](#4-របៀបដំណើរការ-bot-running-the-bot)
   - [ក. ដំណើរការតាមរយៈ Polling (Long-Polling Daemon)](#ក-ដំណើរការតាមរយៈ-polling-long-polling-daemon)
   - [ខ. ដំណើរការតាមរយៈ Webhook](#ខ-ដំណើរការតាមរយៈ-webhook)
5. [សកម្មភាពសំខាន់ៗ (Actions Breakdown)](#5-សកម្មភាពសំខាន់ៗ-actions-breakdown)
6. [ការតភ្ជាប់ជាមួយ Core API (Core API Integration)](#6-ការតភ្ជាប់ជាមួយ-core-api-core-api-integration)
7. [ការធ្វើតេស្ត (Testing)](#7-ការធ្វើតេស្ត-testing)
8. [អថេរបរិស្ថាន (Environment Variables)](#8-អថេរបរិស្ថាន-environment-variables)

---

## 1. ទិដ្ឋភាពទូទៅ (Overview)

សេវាកម្ម **nckhtelegrambot** បម្រើការជា Telegram Assistant សម្រាប់អតិថិជន និងម្ចាស់ហាងក្នុងប្រព័ន្ធពាណិជ្ជកម្មអេឡិចត្រូនិក Nexa Commerce KH៖

- 🛍️ **Storefront Assistant**: ពេលអតិថិជនចុច `/start` លើ Bot របស់ហាង ប្រព័ន្ធនឹងផ្ញើរូបភាព Banner/Logo ព័ត៌មានលម្អិតរបស់ហាង (ឈ្មោះ ជីវប្រវត្តិ ទំនាក់ទំនង) រួមជាមួយប៊ូតុង **"Open Shop"** បើក Telegram Mini App ភ្លាមៗ។
- 📋 **Menu & Catalog**: ឆ្លើយតប `/menu` បង្ហាញមុខទំនិញពេញនិយម និងតម្លៃ។
- 📦 **Order Tracking**: ឆ្លើយតប `/order <លេខវិក្កយបត្រ>` ដើម្បីពិនិត្យស្ថានភាពការកម្ម៉ង់ មុខទំនិញ និងការទូទាត់។
- 💳 **Payment & Alerts**: គាំទ្រព័ត៌មានទូទាត់ ABA KHQR និងពាក្យបញ្ជា `/link <Profile_ID> <Secret_Key>` សម្រាប់ម្ចាស់ហាងភ្ជាប់ Chat ទទួលដំណឹងពេលអតិថិជនបង់ប្រាក់ជោគជ័យ។

---

## 2. រចនាសម្ព័ន្ធគម្រោង (Directory Structure)

```text
backend/nckhtelegrambot/
│
├── app/
│   ├── Actions/
│   │   └── Telegram/
│   │       ├── HandleStartAction.php      # ដំណើរការ /start បង្ហាញ Banner, About, Mini App
│   │       ├── HandleMenuAction.php       # ដំណើរការ /menu បង្ហាញបញ្ជីទំនិញ
│   │       ├── HandleOrderAction.php      # ដំណើរការ /order តាមដានវិក្កយបត្រ
│   │       └── HandlePaymentAction.php    # ដំណើរការ /payment និង /link ទទួលដំណឹងបង់ប្រាក់
│   │
│   ├── Console/
│   │   └── Commands/
│   │       └── TelegramBotRunCommand.php  # Daemon Worker ដំណើរការ Long-Polling 24/7
│   │
│   ├── Enums/
│   │   └── TelegramUpdateType.php        # កំណត់ប្រភេទ Update (message, callback, group)
│   │
│   ├── Http/
│   │   └── Controllers/
│   │       └── Telegram/
│   │           └── WebhookController.php  # ទទួល Update ពី Telegram តាមរយៈ Webhook
│   │
│   ├── Jobs/
│   │   ├── ProcessTelegramUpdate.php     # Queue Job សម្រាប់ដំណើរការ Update
│   │   └── SendTelegramMessage.php       # Queue Job សម្រាប់ផ្ញើសារចេញ
│   │
│   ├── Services/
│   │   ├── Telegram/
│   │   │   ├── TelegramApiService.php     # Client ហៅ Telegram Bot API
│   │   │   ├── TelegramBotService.php     # Orchestrator សម្របសម្រួល Actions
│   │   │   └── TelegramKeyboardService.php# បង្កើត Inline/Reply Keyboards & WebApp buttons
│   │   │
│   │   └── CoreApi/
│   │       └── CoreApiService.php         # Client ទាក់ទង Core API (Shops, Orders, Products)
│   │
│   └── Providers/
│       └── AppServiceProvider.php         # ចុះឈ្មោះ Services ក្នុង IoC Container
│
├── config/
│   ├── telegram.php                       # កំណត់រចនាសម្ព័ន្ធ Telegram API & Tokens
│   └── core-api.php                       # កំណត់ការតភ្ជាប់ទៅកាន់ backend/nckhcoreapi
│
├── routes/
│   ├── api.php                            # ផ្លូវ Webhook & Health check API
│   ├── console.php                        # ផ្លូវ Console commands
│   └── web.php                            # ផ្លូវទំព័រដើម Service Info
│
├── tests/
│   ├── Feature/
│   │   └── Telegram/
│   │       └── WebhookTest.php            # Feature Tests សម្រាប់ Webhook
│   │
│   └── Unit/
│       ├── Actions/
│       │   └── Telegram/                  # Unit Tests សម្រាប់ Actions ទាំងអស់
│       └── Services/
│           ├── Telegram/                  # Unit Tests សម្រាប់ Telegram Services
│           └── CoreApi/                   # Unit Tests សម្រាប់ Core API Service
│
├── storage/                               # ថតរក្សាទុកឯកសារ Cache, Logs, Sessions
├── .env                                   # អថេរបរិស្ថានមូលដ្ឋាន
├── .env.example                           # គំរូអថេរបរិស្ថាន
├── .gitignore
├── artisan                                # កម្មវិធីបញ្ជា Artisan
├── composer.json                          # កញ្ចប់ PHP Dependencies
├── phpunit.xml                            # កំណត់រចនាសម្ព័ន្ធធ្វើតេស្ត PHPUnit
└── README.md
```

---

## 3. ការដំឡើង និងដំណើរការ (Installation & Setup)

### តម្រូវការប្រព័ន្ធ៖
- PHP 8.2 ឬ 8.3+
- Composer 2.x+
- cURL / OpenSSL / mbstring extensions

### ជំហានដំឡើង៖
```bash
cd backend/nckhtelegrambot

# ១. ដំឡើង Composer packages
composer install

# ២. បង្កើតឯកសារ .env
cp .env.example .env

# ៣. បង្កើត APP_KEY
php artisan key:generate
```

---

## 4. របៀបដំណើរការ Bot (Running the Bot)

ប្រព័ន្ធនេះគាំទ្រវិធីដំណើរការពីរយ៉ាង៖ **Long-Polling (Daemon Worker)** និង **Webhook**។

### ក. ដំណើរការតាមរយៈ Polling (Long-Polling Daemon)
សាកសមបំផុតសម្រាប់ការអភិវឌ្ឍលើ Local ឬ Render Background Worker ដោយមិនចាំបាច់មាន Public Domain/SSL HTTPS៖

```bash
# ដំណើរការ Worker ជាប្រចាំ (Auto Heartbeat រៀងរាល់ 60 វិនាទី)
php artisan telegram:bot:run

# ឬដំណើរការកំណត់ Token ជាក់លាក់
php artisan telegram:bot:run --token=123456789:YOUR_BOT_TOKEN

# ដំណើរការកំណត់ចន្លោះពេល Poll (វិនាទី)
php artisan telegram:bot:run --poll-interval=0.5

# ដំណើរការតែម្តងហើយឈប់ (សម្រាប់ Cron ឬ CI)
php artisan telegram:bot:run --once
```

### ខ. ដំណើរការតាមរយៈ Webhook
ប្រសិនបើលោកអ្នកដាក់លើ Server ដែលមាន HTTPS Domain លោកអ្នកអាចប្រើ Webhook៖

1. កំណត់ `TELEGRAM_WEBHOOK_URL` ក្នុង `.env`៖
   ```env
   TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook
   ```
2. ដំណើរការ Web Server៖
   ```bash
   php artisan serve --port=8004
   ```
3. Webhook Endpoint នឹងទទួលទិន្នន័យនៅ៖
   `POST /api/telegram/webhook/{token?}`

---

## 5. សកម្មភាពសំខាន់ៗ (Actions Breakdown)

| សកម្មភាព (Action) | ពាក្យបញ្ជា (Command) | ការពណ៌នា |
|---|---|---|
| **HandleStartAction** | `/start [param]` | ស្វាគមន៍អតិថិជន បង្ហាញ Banner/Logo ព័ត៌មានហាង និងប៊ូតុង **Open Shop** (Mini App) |
| **HandleMenuAction** | `/menu` | ទាញយកមុខទំនិញពេញនិយមពី Core API បង្ហាញតម្លៃ និងប៊ូតុងបើកមើលកាតាឡុកពេញលេញ |
| **HandleOrderAction** | `/order <លេខ>` | តាមដានស្ថានភាពវិក្កយបត្រ (Pending, Paid, Completed) បង្ហាញមុខទំនិញ និងតម្លៃសរុប |
| **HandlePaymentAction**| `/payment`, `/link` | ណែនាំការទូទាត់ ABA KHQR និងភ្ជាប់ Chat ទទួលដំណឹងពេលបង់ប្រាក់ជោគជ័យ |

---

## 6. ការតភ្ជាប់ជាមួយ Core API (Core API Integration)

Service នេះប្រើ `CoreApiService` ដើម្បីទំនាក់ទំនងជាមួយ `backend/nckhcoreapi` (`http://localhost:8003`)៖
- `GET /api/shops/{username}`: ទាញយកព័ត៌មានហាង
- `GET /api/products/public?shop_id={id}`: ទាញយកមុខទំនិញ
- `GET /api/orders/public/track?order_number={number}`: តាមដានស្ថានភាពការកម្ម៉ង់
- `POST /api/bot-service/link`: ផ្ទៀងផ្ទាត់ និងភ្ជាប់ Chat ទទួលការជូនដំណឹងទូទាត់ប្រាក់

---

## 7. ការធ្វើតេស្ត (Testing)

គម្រោងនេះមានទាំង Feature Tests និង Unit Tests ពេញលេញ៖

```bash
# ដំណើរការតេស្តទាំងអស់
php artisan test

# ឬដំណើរការតាម PHPUnit
./vendor/bin/phpunit
```

---

## 8. អថេរបរិស្ថាន (Environment Variables)

| អថេរ | តម្លៃគំរូ | ការពន្យល់ |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | `123456789:ABC...` | Bot Token លំនាំដើមពី @BotFather |
| `TELEGRAM_MINI_APP_URL` | `http://localhost:3006` | URL របស់ Telegram Mini App |
| `TELEGRAM_POLL_INTERVAL` | `0.5` | ចន្លោះពេល Polling គិតជាវិនាទី |
| `CORE_API_BASE_URL` | `http://localhost:8003` | អាសយដ្ឋានរបស់ Core API |
| `CORE_API_SERVICE_KEY` | `your-secret-key` | សោសម្ងាត់ចែករំលែករវាង Bot និង Core API |
| `QUEUE_CONNECTION` | `sync` | Queue Driver (`sync`, `redis`, `database`) |

---

**Nexa Commerce KH Team** © 2026.
