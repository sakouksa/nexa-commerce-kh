<?php

namespace App\Http\Controllers;

use App\Helpers\ShopHelper;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use App\Services\AbaService;
use App\Services\QrService;
use App\Services\TelegramService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ShopController extends Controller
{
    public function getByUsername(string $username)
    {
        $shop = Shop::where('username', $username)->first();
        if (!$shop || $shop->status !== 'active' || $shop->is_expired()) {
            throw new HttpException(404, 'Shop not found or unavailable');
        }

        $d = $shop->to_dict(false);
        $d['payment_configured'] = AbaService::isConfigured($shop);

        $tg = $shop->telegram_dict();
        $botToken = trim($tg['bot_token'] ?? '');
        $d['telegram_login_enabled'] = !empty($botToken);
        $d['telegram_bot_username'] = $botToken ? TelegramService::getBotUsername($botToken) : null;

        return response()->json($d);
    }

    public function getShopMini(string $username)
    {
        $shop = Shop::where('username', $username)->first();
        if (!$shop || $shop->status !== 'active' || $shop->is_expired()) {
            throw new HttpException(404, 'Shop not found or unavailable');
        }

        $d = $shop->to_dict(false);
        $tg = $shop->telegram_dict();
        $d['mini_welcome_kh'] = $tg['mini_welcome_kh'] ?? '';
        $d['mini_welcome_en'] = $tg['mini_welcome_en'] ?? '';
        $d['mini_app_url'] = $tg['mini_app_url'] ?? '';
        $d['payment_configured'] = AbaService::isConfigured($shop);

        $botToken = trim($tg['bot_token'] ?? '');
        $d['telegram_login_enabled'] = !empty($botToken);
        $d['telegram_bot_username'] = $botToken ? TelegramService::getBotUsername($botToken) : null;

        return response()->json($d);
    }

    public function getByIdPublic(int $shopId)
    {
        $shop = Shop::find($shopId);
        if (!$shop || $shop->status !== 'active' || $shop->is_expired()) {
            throw new HttpException(404, 'Shop not found or unavailable');
        }
        return response()->json($shop->to_dict(false));
    }

    public function index(Request $request)
    {
        $shops = Shop::orderBy('id')->get();
        $out = [];
        foreach ($shops as $s) {
            $d = $s->to_dict(true);
            $d['product_count'] = Product::where('shop_id', $s->id)->count();
            $d['category_count'] = Category::where('shop_id', $s->id)->count();
            $d['order_count'] = Order::where('shop_id', $s->id)->count();
            $d['user_count'] = User::where('shop_id', $s->id)->count();
            $out[] = $d;
        }
        return response()->json($out);
    }

    public function detail(Request $request, int $shopId)
    {
        $user = $request->user();
        ShopHelper::requireShopAccess($shopId, $user);

        $shop = Shop::find($shopId);
        if (!$shop) {
            throw new HttpException(404, 'Shop not found');
        }

        $d = $shop->to_dict(true);
        $d['product_count'] = Product::where('shop_id', $shop->id)->count();
        $d['category_count'] = Category::where('shop_id', $shop->id)->count();
        $d['order_count'] = Order::where('shop_id', $shop->id)->count();
        $d['user_count'] = User::where('shop_id', $shop->id)->count();

        return response()->json($d);
    }

    public function checkOwner(Request $request, int $shopId)
    {
        $user = $request->user();
        $isOwner = ((int) $user->shop_id === (int) $shopId && in_array($user->role, ['shop_owner', 'staff'])) || ($user->role === 'admin');
        return response()->json([
            'shop_id' => $shopId,
            'is_owner' => $isOwner,
            'role' => $user->role,
        ]);
    }

    public function store(Request $request)
    {
        $admin = $request->user();
        $username = trim($request->input('username', ''));
        $shopName = trim($request->input('shop_name', ''));
        $email = trim($request->input('email', ''));
        $password = $request->input('password', '');
        $currency = $request->input('currency', 'USD');

        if (!$username || !$password) {
            throw new HttpException(400, 'Username and password are required');
        }
        if (Shop::where('username', $username)->exists()) {
            throw new HttpException(400, 'Shop username already exists');
        }

        $shop = Shop::create([
            'username' => $username,
            'shop_name' => $shopName ?: $username,
            'currency' => $currency,
        ]);

        User::create([
            'username' => $username,
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'shop_owner',
            'shop_id' => $shop->id,
        ]);

        ShopHelper::logActivity('create_shop', "Admin created shop {$shop->username}", $shop->id, $admin);

        return response()->json($shop->to_dict(true));
    }

    public function update(Request $request, int $shopId)
    {
        $user = $request->user();
        ShopHelper::requireShopAccess($shopId, $user);

        $shop = Shop::find($shopId);
        if (!$shop) {
            throw new HttpException(404, 'Shop not found');
        }

        $fields = [
            'shop_name', 'username', 'logo', 'banner', 'bio', 'description',
            'currency', 'contact', 'status',
        ];

        foreach ($fields as $f) {
            if ($request->has($f)) {
                $shop->{$f} = $request->input($f);
            }
        }

        if ($request->has('slideshow')) {
            $shop->slideshow = json_encode($request->input('slideshow'), JSON_UNESCAPED_UNICODE);
        }
        if ($request->has('social_media')) {
            $shop->social_media = json_encode($request->input('social_media'), JSON_UNESCAPED_UNICODE);
        }
        if ($request->has('theme')) {
            $shop->theme = json_encode($request->input('theme'), JSON_UNESCAPED_UNICODE);
        }
        if ($request->has('aba_settings')) {
            $shop->aba_settings = json_encode($request->input('aba_settings'), JSON_UNESCAPED_UNICODE);
        }
        if ($request->has('telegram_settings')) {
            $shop->telegram_settings = json_encode($request->input('telegram_settings'), JSON_UNESCAPED_UNICODE);
        }

        $shop->save();
        ShopHelper::logActivity('update_shop', "{$user->username} updated shop {$shop->username}", $shop->id, $user);

        return response()->json($shop->to_dict(true));
    }

    public function toggleStatus(Request $request, int $shopId)
    {
        $admin = $request->user();
        $shop = Shop::find($shopId);
        if (!$shop) {
            throw new HttpException(404, 'Shop not found');
        }

        $shop->status = $request->input('status', $shop->status);
        $shop->save();

        ShopHelper::logActivity('shop_status', "Admin set shop {$shop->username} status={$shop->status}", $shop->id, $admin);

        return response()->json($shop->to_dict(true));
    }

    public function destroy(Request $request, int $shopId)
    {
        $shop = Shop::find($shopId);
        if (!$shop) {
            throw new HttpException(404, 'Shop not found');
        }

        $shop->delete();
        return response()->json(['ok' => true]);
    }

    public function setExpiry(Request $request, int $shopId)
    {
        $admin = $request->user();
        $shop = Shop::find($shopId);
        if (!$shop) {
            throw new HttpException(404, 'Shop not found');
        }

        $days = (int) $request->input('days', 30);
        if ($days < 0) {
            throw new HttpException(400, 'Days cannot be negative');
        }

        if ($days === 0) {
            $shop->expires_at = null;
        } else {
            $base = ($shop->expires_at && $shop->expires_at->isFuture()) ? $shop->expires_at : Carbon::now();
            $shop->expires_at = $base->copy()->addDays($days);
        }

        $shop->save();
        ShopHelper::logActivity('set_shop_expiry', "Admin set shop {$shop->username} expiry to " . ($shop->expires_at ? $shop->expires_at->toIso8601String() : 'none') . " ({$days} days)", $shop->id, $admin);

        return response()->json($shop->to_dict(true));
    }

    public function setLimits(Request $request, int $shopId)
    {
        $admin = $request->user();
        $shop = Shop::find($shopId);
        if (!$shop) {
            throw new HttpException(404, 'Shop not found');
        }

        foreach (['max_products', 'max_categories'] as $field) {
            if ($request->has($field)) {
                $val = $request->input($field);
                if ($val !== null) {
                    $intVal = (int) $val;
                    if ($intVal < 0) {
                        throw new HttpException(400, "{$field} cannot be negative");
                    }
                    $shop->{$field} = $intVal > 0 ? $intVal : null;
                }
            }
        }

        $shop->save();
        ShopHelper::logActivity('set_shop_limits', "Admin set shop {$shop->username} limits (products=" . ($shop->max_products ?: 'unlimited') . ", categories=" . ($shop->max_categories ?: 'unlimited') . ")", $shop->id, $admin);

        return response()->json($shop->to_dict(true));
    }

    public function qrCode(Request $request, string $username)
    {
        $shop = Shop::where('username', $username)->first();
        if (!$shop || $shop->status !== 'active' || $shop->is_expired()) {
            throw new HttpException(404, 'Shop not found');
        }

        $url = $request->input('url', env('STORE_URL', 'http://localhost:3000') . "/{$shop->username}");
        $logoPath = '';
        if ($shop->logo) {
            $candidate = public_path(ltrim($shop->logo, '/'));
            if (file_exists($candidate)) {
                $logoPath = $candidate;
            }
        }

        $png = QrService::generateShopQr($url, $logoPath);

        return response($png, 200, [
            'Content-Type' => 'image/png',
            'Content-Disposition' => "inline; filename=\"{$shop->username}-qr.png\"",
        ]);
    }
}
