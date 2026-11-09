<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Helpers\ShopHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateSettingRequest;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\Setting;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class SettingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $shopId = $request->input('shop_id');

        if ($shopId === null && $user->role !== 'admin') {
            throw new HttpException(403, 'Admin privileges required');
        }

        if ($shopId !== null) {
            ShopHelper::requireShopAccess((int) $shopId, $user);
            $settings = Setting::where('shop_id', (int) $shopId)->get();
        } else {
            $settings = Setting::whereNull('shop_id')->get();
        }

        return response()->json($settings->map(fn ($s) => $s->to_dict())->toArray());
    }

    public function update(UpdateSettingRequest $request)
    {
        $user = $request->user();
        $shopId = $request->input('shop_id');
        $key = $request->input('key');
        $value = $request->input('value');

        if ($shopId === null && $user->role !== 'admin') {
            throw new HttpException(403, 'Admin privileges required');
        }
        if ($shopId !== null) {
            ShopHelper::requireShopAccess((int) $shopId, $user);
        }

        $valueStr = (is_array($value) || is_object($value) || is_bool($value))
            ? json_encode($value, JSON_UNESCAPED_UNICODE)
            : (string) $value;

        $setting = Setting::where('shop_id', $shopId ? (int) $shopId : null)
            ->where('key', $key)
            ->first();

        if ($setting) {
            $setting->value = $valueStr;
            $setting->save();
        } else {
            $setting = Setting::create([
                'shop_id' => $shopId ? (int) $shopId : null,
                'key' => $key,
                'value' => $valueStr,
            ]);
        }

        return response()->json($setting->to_dict());
    }

    public function platform(Request $request)
    {
        $settings = Setting::whereNull('shop_id')->get();
        $result = [];
        foreach ($settings as $s) {
            $val = $s->value;
            if (is_string($val) && (str_starts_with($val, '{') || str_starts_with($val, '['))) {
                $decoded = json_decode($val, true);
                $result[$s->key] = $decoded !== null ? $decoded : $val;
            } else {
                $result[$s->key] = $val;
            }
        }

        $result['default_admin'] = env('DEFAULT_ADMIN_USERNAME', 'admin');
        $result['contact_telegram'] = '@your_telegram';

        return response()->json($result);
    }

    public function stats(Request $request)
    {
        $shops = Shop::count();
        $activeShops = Shop::where('status', 'active')->count();
        $products = Product::count();
        $orders = Order::count();
        $revenue = round((float) Order::where('payment_status', 'paid')->sum('total'), 2);
        $customers = Customer::count();
        $users = User::count();
        $resellers = User::where('role', 'reseller')->count();

        return response()->json([
            'shops' => $shops,
            'active_shops' => $activeShops,
            'products' => $products,
            'orders' => $orders,
            'revenue' => $revenue,
            'customers' => $customers,
            'users' => $users,
            'resellers' => $resellers,
        ]);
    }
}
