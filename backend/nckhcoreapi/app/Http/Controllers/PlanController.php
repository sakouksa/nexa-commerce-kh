<?php

namespace App\Http\Controllers;

use App\Helpers\ShopHelper;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use App\Services\AbaService;
use App\Services\PaymentNotConfiguredException;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\HttpException;

class PlanController extends Controller
{
    const OFFER_ENDS = "2026-09-07";

    public static function getPlans(): array
    {
        return [
            'starter' => [
                'name' => 'Starter',
                'price' => 9.99,
                'days' => 30,
                'max_products' => 20,
                'max_categories' => 10,
                'free' => true,
                'offer_ends' => self::OFFER_ENDS,
            ],
            'growth' => [
                'name' => 'Growth',
                'price' => 55.99,
                'days' => 180,
                'max_products' => 50,
                'max_categories' => 20,
            ],
            'premium' => [
                'name' => 'Premium',
                'price' => 99.99,
                'days' => 365,
                'max_products' => 200,
                'max_categories' => 30,
            ],
        ];
    }

    public function listPlans()
    {
        $plans = self::getPlans();
        $out = [];
        foreach ($plans as $k => $v) {
            $out[] = array_merge(['id' => $k], $v);
        }
        return response()->json($out);
    }

    protected function findReseller(?string $code): ?User
    {
        $ref = strtolower(trim($code ?? ''));
        if (empty($ref)) return null;

        return User::where('role', 'reseller')
            ->whereRaw('LOWER(referral_code) = ?', [$ref])
            ->first();
    }

    public function registerShopPlan(Request $request)
    {
        $username = strtolower(trim($request->input('username', '')));
        $password = $request->input('password', '');
        $shopName = trim($request->input('shop_name', ''));
        $email = trim($request->input('email', ''));
        $planKey = strtolower(trim($request->input('plan', 'starter')));
        $refCode = trim($request->input('referral_code', ''));
        $successUrl = $request->input('success_url', '');

        if (!$username || !$password) {
            throw new HttpException(400, 'Username and password are required');
        }
        if (Shop::where('username', $username)->exists() || User::where('username', $username)->exists()) {
            throw new HttpException(400, 'Username already exists');
        }

        $plans = self::getPlans();
        if (!isset($plans[$planKey])) {
            throw new HttpException(400, 'Invalid plan');
        }
        $plan = $plans[$planKey];

        $reseller = $this->findReseller($refCode);
        if ($refCode && !$reseller) {
            throw new HttpException(400, 'Invalid referral code');
        }

        $discount = 0.0;
        if ($reseller) {
            $requested = (float) $request->input('discount', 0);
            if ($requested <= 0) {
                $requested = (float) ($reseller->promo_discount ?? 0);
            }
            $discount = max(0.0, min($requested, (float) ($reseller->discount_max ?? 1.0)));
        }

        $basePrice = (float) $plan['price'];
        $isFreeStarter = !empty($plan['free']) && $planKey === 'starter';
        $finalPrice = $isFreeStarter ? 0.0 : max(0.0, round($basePrice - $discount, 2));

        $shop = Shop::create([
            'username' => $username,
            'shop_name' => $shopName ?: $username,
            'status' => $finalPrice <= 0 ? 'active' : 'pending',
            'plan' => $planKey,
            'plan_price' => $finalPrice,
            'plan_discount' => $discount,
            'plan_started_at' => now(),
            'expires_at' => $finalPrice <= 0 ? now()->addDays($plan['days']) : null,
            'max_products' => $plan['max_products'],
            'max_categories' => $plan['max_categories'],
            'reseller_id' => $reseller ? $reseller->id : null,
        ]);

        $user = User::create([
            'username' => $username,
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'shop_owner',
            'shop_id' => $shop->id,
            'status' => 'active',
        ]);

        if ($finalPrice <= 0) {
            // Free starter plan activation
            return response()->json([
                'free' => true,
                'shop' => $shop->to_dict(true),
                'detail' => 'Shop registered and activated successfully on the free Starter plan!',
            ]);
        }

        // Paid plan: create order under platform merchant shop
        $platformShopUsername = env('PLATFORM_SHOP_USERNAME', 'demo');
        $platformShop = Shop::where('username', $platformShopUsername)->first() ?: Shop::first();

        $order = Order::create([
            'shop_id' => $platformShop->id,
            'order_number' => 'PLN' . time() . random_int(100, 999),
            'customer_name' => $shop->shop_name ?: $shop->username,
            'customer_email' => $user->email,
            'items_total' => $basePrice,
            'discount' => $discount,
            'total' => $finalPrice,
            'currency' => 'USD',
            'payment_method' => 'aba',
            'payment_status' => 'pending',
            'order_status' => 'pending',
            'customer_note' => "Plan subscription for shop {$shop->username} ({$plan['name']})",
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_name' => "Plan: {$plan['name']} ({$plan['days']} days)",
            'price' => $basePrice,
            'quantity' => 1,
        ]);

        try {
            $checkout = AbaService::buildCheckoutUrl($order, $platformShop, $successUrl);
            $order->transaction_id = $checkout['transaction_id'];
            $order->save();

            return response()->json([
                'free' => false,
                'order_id' => $order->id,
                'shop_id' => $shop->id,
                'checkout_url' => $checkout['checkout_url'],
                'qr' => $checkout['qr'],
                'qr_image' => $checkout['qr_image'],
                'amount' => $finalPrice,
            ]);
        } catch (PaymentNotConfiguredException $e) {
            // Fallback: if platform ABA is not yet set up, activate shop
            $shop->status = 'active';
            $shop->expires_at = now()->addDays($plan['days']);
            $shop->save();
            $order->payment_status = 'paid';
            $order->save();

            return response()->json([
                'free' => false,
                'shop' => $shop->to_dict(true),
                'detail' => 'Shop activated (platform payment in test mode).',
            ]);
        }
    }

    public function confirmPlan(Request $request)
    {
        $orderId = (int) $request->input('order_id');
        $shopId = (int) $request->input('shop_id');
        $tx = $request->input('transaction_id');

        $order = Order::find($orderId);
        $shop = Shop::find($shopId);

        if (!$order || !$shop) {
            throw new HttpException(404, 'Order or shop not found');
        }

        $plans = self::getPlans();
        $plan = $plans[$shop->plan] ?? $plans['starter'];

        $order->payment_status = 'paid';
        $order->paid_at = now();
        if ($tx) $order->transaction_id = $tx;
        $order->save();

        $shop->status = 'active';
        $shop->expires_at = now()->addDays($plan['days']);
        $shop->save();

        return response()->json([
            'ok' => true,
            'shop' => $shop->to_dict(true),
            'detail' => 'Plan confirmed and shop activated!',
        ]);
    }

    public function upgradePlan(Request $request)
    {
        $shopId = (int) $request->input('shop_id');
        $planKey = strtolower(trim($request->input('plan', '')));
        $successUrl = $request->input('success_url', '');

        $shop = Shop::find($shopId);
        if (!$shop) {
            throw new HttpException(404, 'Shop not found');
        }

        $plans = self::getPlans();
        if (!isset($plans[$planKey])) {
            throw new HttpException(400, 'Invalid plan');
        }
        $plan = $plans[$planKey];

        $platformShopUsername = env('PLATFORM_SHOP_USERNAME', 'demo');
        $platformShop = Shop::where('username', $platformShopUsername)->first() ?: Shop::first();

        $price = (float) $plan['price'];
        $order = Order::create([
            'shop_id' => $platformShop->id,
            'order_number' => 'UPG' . time() . random_int(100, 999),
            'customer_name' => $shop->shop_name ?: $shop->username,
            'items_total' => $price,
            'total' => $price,
            'currency' => 'USD',
            'payment_method' => 'aba',
            'customer_note' => "Plan upgrade for shop {$shop->username} to {$plan['name']}",
        ]);

        try {
            $checkout = AbaService::buildCheckoutUrl($order, $platformShop, $successUrl);
            $order->transaction_id = $checkout['transaction_id'];
            $order->save();

            return response()->json([
                'order_id' => $order->id,
                'shop_id' => $shop->id,
                'checkout_url' => $checkout['checkout_url'],
                'amount' => $price,
            ]);
        } catch (\Exception $e) {
            throw new HttpException(400, $e->getMessage());
        }
    }

    public function shopPlan(int $shopId)
    {
        $shop = Shop::find($shopId);
        if (!$shop) {
            throw new HttpException(404, 'Shop not found');
        }

        $plans = self::getPlans();
        $currentPlan = $plans[$shop->plan] ?? null;

        return response()->json([
            'shop_id' => $shop->id,
            'plan' => $shop->plan,
            'plan_details' => $currentPlan,
            'expires_at' => $shop->expires_at ? $shop->expires_at->toIso8601String() : null,
            'is_expired' => $shop->is_expired(),
            'max_products' => $shop->max_products,
            'max_categories' => $shop->max_categories,
        ]);
    }

    // --- Reseller Management ---

    public static function resellerCustomerData(array $shopIds): array
    {
        if (empty($shopIds)) {
            return [];
        }

        $registered = Customer::whereIn('shop_id', $shopIds)->get();
        $orders = Order::whereIn('shop_id', $shopIds)->get();

        $orderCustomers = [];
        foreach ($orders as $o) {
            $key = trim($o->customer_phone ?: ($o->customer_name ?: ''));
            if (!$key) continue;
            if ($o->customer_id) continue; // already counted as registered

            if (!isset($orderCustomers[$key])) {
                $orderCustomers[$key] = [
                    'name' => $o->customer_name ?: '',
                    'phone' => $o->customer_phone ?: '',
                    'shop_id' => $o->shop_id,
                    'orders' => 0,
                ];
            }
            $orderCustomers[$key]['orders'] += 1;
        }

        $rows = [];
        foreach ($registered as $c) {
            $shop = Shop::find($c->shop_id);
            $orderCount = Order::where('customer_id', $c->id)->count();
            $rows[] = [
                'id' => $c->id,
                'type' => 'registered',
                'shop_id' => $c->shop_id,
                'shop_username' => $shop ? $shop->username : null,
                'name' => $c->name ?: ($c->username ?: ''),
                'phone' => $c->phone ?: '',
                'telegram' => $c->telegram ?: ($c->telegram_username ?: ''),
                'email' => $c->email ?: '',
                'orders' => $orderCount,
                'created_at' => $c->created_at ? $c->created_at->toIso8601String() : null,
            ];
        }

        foreach ($orderCustomers as $key => $e) {
            $shop = Shop::find($e['shop_id']);
            $rows[] = [
                'id' => null,
                'type' => 'guest',
                'shop_id' => $e['shop_id'],
                'shop_username' => $shop ? $shop->username : null,
                'name' => $e['name'],
                'phone' => $e['phone'],
                'telegram' => '',
                'email' => '',
                'orders' => $e['orders'],
                'created_at' => null,
            ];
        }

        return $rows;
    }

    public function listResellers()
    {
        $resellers = User::where('role', 'reseller')->get();
        $out = [];
        foreach ($resellers as $r) {
            $shops = Shop::where('reseller_id', $r->id)->get();
            $shopIds = $shops->pluck('id')->toArray();
            $sales = (float) $shops->where('status', 'active')->sum('plan_price');
            $commission = round($sales * ((float) ($r->commission_rate ?: 0)) / 100.0, 2);
            $customerCount = count(self::resellerCustomerData($shopIds));

            $out[] = [
                'id' => $r->id,
                'username' => $r->username,
                'email' => $r->email,
                'referral_code' => $r->referral_code,
                'commission_rate' => (float) $r->commission_rate,
                'discount_max' => $r->discount_max !== null ? (float) $r->discount_max : 1.0,
                'promo_discount' => $r->promo_discount !== null ? (float) $r->promo_discount : 0.0,
                'commission_paid' => $r->commission_paid ?: 'not_yet',
                'commission_paid_at' => $r->commission_paid_at ? $r->commission_paid_at->toIso8601String() : null,
                'status' => $r->status,
                'shop_count' => $shops->count(),
                'customer_count' => $customerCount,
                'sales' => round($sales, 2),
                'commission' => $commission,
                'shops' => $shops->map(fn($s) => [
                    'id' => $s->id,
                    'username' => $s->username,
                    'shop_name' => $s->shop_name,
                    'plan' => $s->plan,
                    'plan_price' => (float) ($s->plan_price ?? 0),
                    'status' => $s->status,
                ])->values()->toArray(),
            ];
        }
        return response()->json($out);
    }

    public function resellerCustomers(int $resellerId)
    {
        $reseller = User::where('id', $resellerId)->where('role', 'reseller')->first();
        if (!$reseller) {
            throw new HttpException(404, 'Reseller not found');
        }

        $shopIds = Shop::where('reseller_id', $resellerId)->pluck('id')->toArray();
        $customers = self::resellerCustomerData($shopIds);

        return response()->json([
            'reseller_id' => $resellerId,
            'count' => count($customers),
            'customers' => $customers,
        ]);
    }

    public function getReseller(int $resellerId)
    {
        $reseller = User::where('id', $resellerId)->where('role', 'reseller')->first();
        if (!$reseller) {
            throw new HttpException(404, 'Reseller not found');
        }

        $shops = Shop::where('reseller_id', $resellerId)->get();
        $shopList = [];
        foreach ($shops as $s) {
            $paidOrders = Order::where('shop_id', $s->id)->where('payment_status', 'paid')->get();
            $revenue = round($paidOrders->sum('total'), 2);

            $shopList[] = [
                'id' => $s->id,
                'username' => $s->username,
                'shop_name' => $s->shop_name,
                'logo' => $s->logo,
                'plan' => $s->plan,
                'plan_price' => (float) ($s->plan_price ?? 0),
                'plan_discount' => (float) ($s->plan_discount ?? 0),
                'status' => $s->status,
                'currency' => $s->currency,
                'created_at' => $s->created_at ? $s->created_at->toIso8601String() : null,
                'expires_at' => $s->expires_at ? $s->expires_at->toIso8601String() : null,
                'product_count' => Product::where('shop_id', $s->id)->count(),
                'category_count' => Category::where('shop_id', $s->id)->count(),
                'order_count' => Order::where('shop_id', $s->id)->count(),
                'customer_count' => Customer::where('shop_id', $s->id)->count(),
                'revenue' => $revenue,
            ];
        }

        $shopIds = $shops->pluck('id')->toArray();
        $customers = self::resellerCustomerData($shopIds);
        $activeShops = array_filter($shopList, fn($s) => $s['status'] === 'active');
        $sales = (float) array_sum(array_column($activeShops, 'plan_price'));
        $commission = round($sales * ((float) ($reseller->commission_rate ?: 0)) / 100.0, 2);

        $storeUrl = config('app.url', 'http://localhost:3000');

        return response()->json([
            'id' => $reseller->id,
            'username' => $reseller->username,
            'email' => $reseller->email,
            'referral_code' => $reseller->referral_code,
            'commission_rate' => (float) $reseller->commission_rate,
            'discount_max' => $reseller->discount_max !== null ? (float) $reseller->discount_max : 1.0,
            'promo_discount' => $reseller->promo_discount !== null ? (float) $reseller->promo_discount : 0.0,
            'commission_paid' => $reseller->commission_paid ?: 'not_yet',
            'commission_paid_at' => $reseller->commission_paid_at ? $reseller->commission_paid_at->toIso8601String() : null,
            'status' => $reseller->status,
            'role' => $reseller->role,
            'created_at' => $reseller->created_at ? $reseller->created_at->toIso8601String() : null,
            'signup_link' => "{$storeUrl}/create-shop?ref={$reseller->referral_code}",
            'shop_count' => count($shopList),
            'customer_count' => count($customers),
            'sales' => round($sales, 2),
            'commission' => $commission,
            'shops' => $shopList,
            'customers' => $customers,
        ]);
    }

    public function createReseller(Request $request)
    {
        $username = trim($request->input('username', ''));
        $email = trim($request->input('email', ''));
        $password = $request->input('password', '');
        $code = trim($request->input('referral_code', ''));
        $rate = (float) $request->input('commission_rate', 10.0);

        if (!$username || !$password) {
            throw new HttpException(400, 'Username and password are required');
        }
        if (User::where('username', $username)->exists()) {
            throw new HttpException(400, 'Username already exists');
        }

        $reseller = User::create([
            'username' => $username,
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'reseller',
            'referral_code' => $code ?: $username,
            'commission_rate' => $rate,
            'discount_max' => 1.0,
            'promo_discount' => 0.0,
        ]);

        return response()->json($reseller->to_dict());
    }

    public function updateReseller(Request $request, int $resellerId)
    {
        $reseller = User::where('id', $resellerId)->where('role', 'reseller')->first();
        if (!$reseller) {
            throw new HttpException(404, 'Reseller not found');
        }

        if ($request->has('email')) $reseller->email = $request->input('email');
        if ($request->has('referral_code')) $reseller->referral_code = $request->input('referral_code');
        if ($request->has('commission_rate')) $reseller->commission_rate = (float) $request->input('commission_rate');
        if ($request->has('discount_max')) $reseller->discount_max = (float) $request->input('discount_max');
        if ($request->has('status')) $reseller->status = $request->input('status');
        if ($request->has('commission_paid')) {
            $reseller->commission_paid = $request->input('commission_paid');
            if ($reseller->commission_paid === 'paid') {
                $reseller->commission_paid_at = now();
            }
        }
        if ($request->filled('password')) {
            $reseller->password = Hash::make($request->input('password'));
        }

        $reseller->save();
        return response()->json(['ok' => true]);
    }

    public function deleteReseller(int $resellerId)
    {
        $reseller = User::where('id', $resellerId)->where('role', 'reseller')->first();
        if (!$reseller) {
            throw new HttpException(404, 'Reseller not found');
        }

        $reseller->delete();
        return response()->json(['ok' => true]);
    }

    public function resellerMe(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'reseller') {
            throw new HttpException(403, 'Reseller account required');
        }

        $shops = Shop::where('reseller_id', $user->id)->get();
        $shopRows = [];
        foreach ($shops as $s) {
            $shopRows[] = [
                'id' => $s->id,
                'username' => $s->username,
                'shop_name' => $s->shop_name,
                'plan' => $s->plan,
                'plan_price' => (float) ($s->plan_price ?? 0),
                'plan_discount' => (float) ($s->plan_discount ?? 0),
                'status' => $s->status,
                'created_at' => $s->created_at ? $s->created_at->toIso8601String() : null,
                'expires_at' => $s->expires_at ? $s->expires_at->toIso8601String() : null,
            ];
        }

        $active = array_filter($shopRows, fn($s) => $s['status'] === 'active');
        $sales = (float) array_sum(array_column($active, 'plan_price'));
        $rate = ((float) ($user->commission_rate ?: 0)) / 100.0;
        $commission = round($sales * $rate, 2);

        // Chart data
        $signups = [];
        foreach ($shopRows as $s) {
            $m = substr($s['created_at'] ?? date('Y-m-d'), 0, 7);
            $signups[$m] = ($signups[$m] ?? 0) + 1;
        }
        $months = array_keys($signups);
        sort($months);
        $months = array_slice($months, -6);
        if (empty($months)) {
            $months = [date('Y-m')];
        }

        $shopsByStatus = [];
        $shopsByPlan = [];
        $commissionByShop = [];
        foreach ($shopRows as $s) {
            $st = $s['status'] ?? 'unknown';
            $shopsByStatus[$st] = ($shopsByStatus[$st] ?? 0) + 1;
            $pl = $s['plan'] ?: 'none';
            $shopsByPlan[$pl] = ($shopsByPlan[$pl] ?? 0) + 1;
            if ($s['status'] === 'active') {
                $commissionByShop[] = [
                    'username' => $s['username'],
                    'shop_name' => $s['shop_name'],
                    'paid' => $s['plan_price'],
                    'commission' => round($s['plan_price'] * $rate, 2),
                ];
            }
        }
        usort($commissionByShop, fn($a, $b) => $b['commission'] <=> $a['commission']);

        $plansList = [];
        foreach (self::getPlans() as $k => $v) {
            $plansList[] = array_merge(['id' => $k], $v);
        }

        return response()->json([
            'username' => $user->username,
            'email' => $user->email,
            'referral_code' => $user->referral_code,
            'commission_rate' => (float) $user->commission_rate,
            'discount_max' => $user->discount_max !== null ? (float) $user->discount_max : 1.0,
            'promo_discount' => $user->promo_discount !== null ? (float) $user->promo_discount : 0.0,
            'commission_paid' => $user->commission_paid ?: 'not_yet',
            'commission_paid_at' => $user->commission_paid_at ? $user->commission_paid_at->toIso8601String() : null,
            'shop_count' => count($shopRows),
            'sales' => round($sales, 2),
            'commission' => $commission,
            'plans' => $plansList,
            'shops' => $shopRows,
            'charts' => [
                'signup_months' => $months,
                'signup_series' => array_map(fn($m) => $signups[$m] ?? 0, $months),
                'shops_by_status' => $shopsByStatus,
                'shops_by_plan' => $shopsByPlan,
                'commission_by_shop' => array_slice($commissionByShop, 0, 8),
            ],
        ]);
    }

    public function resellerPromo(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'reseller') {
            throw new HttpException(403, 'Reseller account required');
        }

        $cap = (float) ($user->discount_max !== null ? $user->discount_max : 1.0);
        $val = (float) $request->input('promo_discount', 0);
        $user->promo_discount = round(max(0.0, min($val, $cap)), 2);
        $user->save();

        return response()->json([
            'ok' => true,
            'promo_discount' => (float) $user->promo_discount,
            'discount_max' => $cap,
        ]);
    }

    public function resellerExport(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'reseller') {
            throw new HttpException(403, 'Reseller account required');
        }

        $fmt = strtolower($request->input('export_format', 'zip') ?: 'zip');
        $shops = Shop::where('reseller_id', $user->id)->get();
        $ts = date('Ymd_His');
        $backupDir = public_path('backups');
        if (!File::exists($backupDir)) {
            File::makeDirectory($backupDir, 0755, true);
        }

        if ($fmt === 'xlsx') {
            $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
            $ws = $spreadsheet->getActiveSheet();
            $ws->setTitle('Reseller');
            $ws->fromArray([
                ['Username', $user->username],
                ['Referral Code', $user->referral_code],
                ['Commission Rate %', (float) $user->commission_rate],
                ['Max Discount $', (float) $user->discount_max],
            ]);

            $ws2 = $spreadsheet->createSheet();
            $ws2->setTitle('Shops');
            $ws2->fromArray([
                ['ID', 'Username', 'Shop Name', 'Plan', 'Plan Price $', 'Discount $', 'Status', 'Expires'],
            ]);
            $rIdx = 2;
            foreach ($shops as $s) {
                $ws2->fromArray([[
                    $s->id,
                    $s->username,
                    $s->shop_name,
                    $s->plan,
                    (float) $s->plan_price,
                    (float) $s->plan_discount,
                    $s->status,
                    $s->expires_at ? $s->expires_at->format('Y-m-d') : '',
                ]], null, "A{$rIdx}");
                $rIdx++;
            }

            $ws3 = $spreadsheet->createSheet();
            $ws3->setTitle('Commissions');
            $ws3->fromArray([
                ['Shop', 'Plan Price $', 'Commission Rate %', 'Commission $'],
            ]);
            $rIdx = 2;
            foreach ($shops as $s) {
                $comm = round(((float) $s->plan_price) * ((float) $user->commission_rate) / 100.0, 2);
                $ws3->fromArray([[
                    $s->username,
                    (float) $s->plan_price,
                    (float) $user->commission_rate,
                    $comm,
                ]], null, "A{$rIdx}");
                $rIdx++;
            }

            $filename = "reseller_{$user->username}_{$ts}.xlsx";
            $filepath = "{$backupDir}/{$filename}";
            $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
            $writer->save($filepath);

            return response()->download($filepath, $filename, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ]);
        }

        if ($fmt === 'json') {
            $data = [
                'version' => 1,
                'type' => 'reseller',
                'exported_at' => now()->toIso8601String(),
                'reseller' => [
                    'username' => $user->username,
                    'email' => $user->email,
                    'referral_code' => $user->referral_code,
                    'commission_rate' => (float) $user->commission_rate,
                    'discount_max' => (float) $user->discount_max,
                ],
                'shops' => array_map(fn($s) => \App\Services\BackupService::collectShopData($s->id), $shops->all()),
            ];

            $filename = "reseller_{$user->username}_{$ts}.json";
            $filepath = "{$backupDir}/{$filename}";
            File::put($filepath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

            return response()->download($filepath, $filename, [
                'Content-Type' => 'application/json',
            ]);
        }

        // default: ZIP with one JSON per shop + summary
        $filename = "reseller_{$user->username}_{$ts}.zip";
        $filepath = "{$backupDir}/{$filename}";
        $zip = new \ZipArchive();
        if ($zip->open($filepath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) === true) {
            $summary = [
                'version' => 1,
                'type' => 'reseller',
                'exported_at' => now()->toIso8601String(),
                'reseller' => [
                    'username' => $user->username,
                    'email' => $user->email,
                    'referral_code' => $user->referral_code,
                    'commission_rate' => (float) $user->commission_rate,
                    'discount_max' => (float) $user->discount_max,
                ],
                'shop_count' => $shops->count(),
            ];
            $zip->addFromString('reseller_info.json', json_encode($summary, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            foreach ($shops as $s) {
                $shopData = \App\Services\BackupService::collectShopData($s->id);
                $zip->addFromString("shop_{$s->username}.json", json_encode($shopData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            }
            $zip->close();
        }

        return response()->download($filepath, $filename, [
            'Content-Type' => 'application/zip',
        ]);
    }

    public function resellerImport(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'reseller') {
            throw new HttpException(403, 'Reseller account required');
        }

        $file = $request->file('file');
        if (!$file) {
            throw new HttpException(400, 'No file uploaded');
        }

        $ext = strtolower($file->getClientOriginalExtension());
        if (!in_array($ext, ['json', 'zip'])) {
            throw new HttpException(400, 'Only .json or .zip backups can be imported');
        }

        $tmpDir = storage_path('app/temp_reseller_import_' . uniqid());
        File::makeDirectory($tmpDir, 0755, true);
        $saved = "{$tmpDir}/import.{$ext}";
        $file->move($tmpDir, "import.{$ext}");

        $count = 0;
        $skipped = 0;

        try {
            if ($ext === 'zip') {
                $zip = new \ZipArchive();
                if ($zip->open($saved) === true) {
                    for ($i = 0; $i < $zip->numFiles; $i++) {
                        $name = $zip->getNameIndex($i);
                        if (!str_ends_with($name, '.json') || $name === 'reseller_info.json') {
                            continue;
                        }
                        $content = $zip->getFromIndex($i);
                        $jsonPath = "{$tmpDir}/" . basename($name);
                        File::put($jsonPath, $content);

                        try {
                            [$c, $sk] = $this->importOneResellerShop($jsonPath, $user);
                            $count += $c;
                            $skipped += $sk;
                        } catch (\Exception $e) {
                            $skipped++;
                        }
                    }
                    $zip->close();
                }
            } else {
                try {
                    [$c, $sk] = $this->importOneResellerShop($saved, $user);
                    $count += $c;
                    $skipped += $sk;
                } catch (\Exception $e) {
                    $skipped++;
                }
            }
        } finally {
            File::deleteDirectory($tmpDir);
        }

        return response()->json([
            'ok' => true,
            'records_restored' => $count,
            'duplicates_skipped' => $skipped,
        ]);
    }

    protected function importOneResellerShop(string $filepath, User $user): array
    {
        $content = File::get($filepath);
        $data = json_decode($content, true);
        if (!$data) return [0, 1];

        $payloads = ($data['type'] ?? '') === 'reseller' && isset($data['shops'])
            ? $data['shops']
            : [$data];

        $total = 0;
        $skipped = 0;

        foreach ($payloads as $payload) {
            $shopDict = $payload['shop'] ?? [];
            $username = trim($shopDict['username'] ?? '');
            if (!$username) {
                $skipped++;
                continue;
            }

            $shop = Shop::where('username', $username)->first();
            if (!$shop || $shop->reseller_id !== $user->id) {
                $skipped++;
                continue;
            }

            $tempFile = tempnam(sys_get_temp_dir(), 'shop_imp_') . '.json';
            File::put($tempFile, json_encode($payload, JSON_UNESCAPED_UNICODE));
            try {
                [$c, $sk, $imgs] = \App\Services\BackupService::importShopBackup($shop->id, $tempFile);
                $total += $c;
                $skipped += $sk;
            } finally {
                @unlink($tempFile);
            }
        }

        return [$total, $skipped];
    }

    public function platformCharts(Request $request)
    {
        // 1) Revenue by day (last 30 days)
        $since = Carbon::now()->subDays(29)->startOfDay();
        $paidOrders = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', $since)
            ->get();

        $byDay = [];
        foreach ($paidOrders as $o) {
            $dateCol = $o->paid_at ?: $o->created_at;
            $d = $dateCol ? Carbon::parse($dateCol)->format('Y-m-d') : date('Y-m-d');
            $byDay[$d] = round(($byDay[$d] ?? 0) + (float) $o->total, 2);
        }

        $days = [];
        $revenueSeries = [];
        for ($i = 0; $i < 30; $i++) {
            $d = Carbon::now()->subDays(29 - $i)->format('Y-m-d');
            $days[] = $d;
            $revenueSeries[] = $byDay[$d] ?? 0;
        }

        // 2) Orders by payment status
        $ordersByStatus = Order::select('payment_status', DB::raw('count(*) as count'))
            ->groupBy('payment_status')
            ->get()
            ->map(fn($row) => ['status' => $row->payment_status ?: 'unknown', 'count' => (int) $row->count])
            ->toArray();

        // 3) Shops by plan
        $shopsByPlan = Shop::select('plan', DB::raw('count(*) as count'))
            ->groupBy('plan')
            ->get()
            ->map(fn($row) => ['plan' => $row->plan ?: 'none', 'count' => (int) $row->count])
            ->toArray();

        // 4) Top shops by paid revenue
        $shops = Shop::all();
        $top = [];
        foreach ($shops as $s) {
            $rev = Order::where('shop_id', $s->id)->where('payment_status', 'paid')->sum('total');
            $top[] = [
                'id' => $s->id,
                'username' => $s->username,
                'shop_name' => $s->shop_name,
                'revenue' => round((float) $rev, 2),
            ];
        }
        usort($top, fn($a, $b) => $b['revenue'] <=> $a['revenue']);

        // 5) Resellers: commission + payment status
        $resellers = [];
        foreach (User::where('role', 'reseller')->get() as $r) {
            $rshops = Shop::where('reseller_id', $r->id)->where('status', 'active')->get();
            $sales = (float) $rshops->sum('plan_price');
            $resellers[] = [
                'username' => $r->username,
                'sales' => round($sales, 2),
                'commission' => round($sales * ((float) ($r->commission_rate ?: 0)) / 100.0, 2),
                'commission_paid' => $r->commission_paid ?: 'not_yet',
            ];
        }

        // 6) Shop signups by month (last 6 months)
        $signups = [];
        foreach ($shops as $s) {
            $m = $s->created_at ? $s->created_at->format('Y-m') : date('Y-m');
            $signups[$m] = ($signups[$m] ?? 0) + 1;
        }
        $months = array_keys($signups);
        sort($months);
        $months = array_slice($months, -6);
        if (empty($months)) {
            $months = [date('Y-m')];
        }

        return response()->json([
            'revenue_days' => $days,
            'revenue_series' => $revenueSeries,
            'orders_by_status' => $ordersByStatus,
            'shops_by_plan' => $shopsByPlan,
            'top_shops' => array_slice($top, 0, 6),
            'resellers' => $resellers,
            'signup_months' => $months,
            'signup_series' => array_map(fn($m) => $signups[$m] ?? 0, $months),
        ]);
    }
}
