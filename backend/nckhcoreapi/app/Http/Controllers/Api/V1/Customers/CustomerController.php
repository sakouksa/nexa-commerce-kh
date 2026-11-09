<?php

namespace App\Http\Controllers\Api\V1\Customers;

use App\Helpers\ShopHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Customers\CustomerSigninRequest;
use App\Http\Requests\Customers\CustomerSignupRequest;
use App\Http\Requests\Customers\StoreCustomerRequest;
use App\Http\Requests\Customers\UpdateCustomerRequest;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Shop;
use App\Services\Auth\JwtService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CustomerController extends Controller
{
    protected JwtService $jwtService;

    public function __construct(JwtService $jwtService)
    {
        $this->jwtService = $jwtService;
    }

    protected function customerToken(Customer $customer): array
    {
        $token = $this->jwtService->createToken([
            'sub' => (string) $customer->id,
            'role' => 'customer',
            'shop_id' => $customer->shop_id,
        ]);

        return [
            'access_token' => $token,
            'token_type' => 'bearer',
            'customer' => $customer->to_dict(),
        ];
    }

    public function signup(CustomerSignupRequest $request)
    {
        $shopId = (int) $request->input('shop_id');
        $shop = Shop::find($shopId);
        if (! $shop || $shop->status !== 'active') {
            throw new HttpException(404, 'Shop not found');
        }

        $password = $request->input('password', '');
        if (strlen($password) < 4) {
            throw new HttpException(400, 'Password must be at least 4 characters');
        }

        $phone = trim($request->input('phone', ''));
        if (empty($phone)) {
            throw new HttpException(400, 'Phone number is required');
        }

        $username = trim($request->input('username', ''));
        if (empty($username)) {
            throw new HttpException(400, 'Username is required');
        }

        $fullName = trim($request->input('full_name', ''));
        if (empty($fullName)) {
            $fullName = trim($request->input('name', ''));
        }
        if (empty($fullName)) {
            $fullName = trim($request->input('first_name', '').' '.$request->input('last_name', ''));
        }
        if (empty($fullName)) {
            $fullName = $username;
        }

        $parts = explode(' ', $fullName, 2);
        $firstName = $parts[0];
        $lastName = $parts[1] ?? '';

        $email = trim($request->input('email', ''));

        // Check duplicate
        $existing = Customer::where('shop_id', $shopId)
            ->where(function ($q) use ($phone, $email, $username) {
                $q->where('phone', $phone)
                    ->orWhereRaw('LOWER(username) = ?', [strtolower($username)]);
                if ($email) {
                    $q->orWhere('email', $email);
                }
            })->first();

        if ($existing) {
            throw new HttpException(400, 'An account with this username, phone or email already exists');
        }

        $tgUser = trim($request->input('telegram_username', ''));
        $tgPhone = trim($request->input('telegram_phone', ''));
        $telegramHandle = $tgUser ? "@{$tgUser}" : $tgPhone;

        $customer = Customer::create([
            'shop_id' => $shopId,
            'username' => $username,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'gender' => $request->input('gender', ''),
            'name' => $fullName,
            'phone' => $phone,
            'email' => $email,
            'password' => Hash::make($password),
            'telegram' => $telegramHandle,
            'telegram_username' => $tgUser,
            'telegram_phone' => $tgPhone,
        ]);

        ShopHelper::logActivity('customer_signup', "Customer {$customer->name} signed up at shop {$shop->id}", $shopId);

        return response()->json($this->customerToken($customer));
    }

    public function signin(CustomerSigninRequest $request)
    {
        $shopId = (int) $request->input('shop_id');
        $identifier = strtolower(trim($request->input('identifier', '')));
        $password = $request->input('password', '');

        if (! $identifier) {
            throw new HttpException(400, 'Please enter your username, email or phone');
        }

        $customer = Customer::where('shop_id', $shopId)
            ->where(function ($q) use ($identifier) {
                $q->where('phone', $identifier)
                    ->orWhere('email', $identifier)
                    ->orWhereRaw('LOWER(username) = ?', [$identifier]);
            })->first();

        if (! $customer || empty($customer->password)) {
            throw new HttpException(401, 'No account found. Please sign up first.');
        }

        if (! Hash::check($password, $customer->password)) {
            throw new HttpException(401, 'Invalid password');
        }

        return response()->json($this->customerToken($customer));
    }

    public function me(Request $request)
    {
        $customer = $request->attributes->get('customer');
        if (! $customer) {
            throw new HttpException(401, 'Customer not found');
        }

        return response()->json($customer->to_dict());
    }

    public function updateMe(Request $request)
    {
        $customer = $request->attributes->get('customer');
        if (! $customer) {
            throw new HttpException(401, 'Customer not found');
        }

        if ($request->has('username')) {
            $username = trim($request->input('username'));
            if ($username) {
                $dup = Customer::where('shop_id', $customer->shop_id)
                    ->whereRaw('LOWER(username) = ?', [strtolower($username)])
                    ->where('id', '!=', $customer->id)
                    ->first();
                if ($dup) {
                    throw new HttpException(400, 'Username already taken');
                }
                $customer->username = $username;
            }
        }

        if ($request->filled('full_name')) {
            $full = trim($request->input('full_name'));
            $customer->name = $full;
            $parts = explode(' ', $full, 2);
            $customer->first_name = $parts[0];
            $customer->last_name = $parts[1] ?? '';
        }
        if ($request->has('gender')) {
            $customer->gender = $request->input('gender');
        }
        if ($request->filled('email')) {
            $customer->email = trim($request->input('email'));
        }
        if ($request->filled('phone')) {
            $customer->phone = trim($request->input('phone'));
        }
        if ($request->filled('telegram_username')) {
            $tu = trim($request->input('telegram_username'));
            $customer->telegram_username = $tu;
            $customer->telegram = "@{$tu}";
        }
        if ($request->filled('telegram_phone')) {
            $customer->telegram_phone = trim($request->input('telegram_phone'));
        }
        if ($request->has('address')) {
            $customer->address = $request->input('address');
        }
        if ($request->has('city')) {
            $customer->city = $request->input('city');
        }
        if ($request->has('country')) {
            $customer->country = $request->input('country');
        }

        $customer->save();
        ShopHelper::logActivity('customer_update_profile', "Customer {$customer->name} updated their profile", $customer->shop_id);

        return response()->json($customer->to_dict());
    }

    public function changePassword(Request $request)
    {
        $customer = $request->attributes->get('customer');
        if (! $customer) {
            throw new HttpException(401, 'Customer not found');
        }

        $current = $request->input('current_password', '');
        $new = $request->input('new_password', '');

        if (! Hash::check($current, $customer->password)) {
            throw new HttpException(400, 'Current password is incorrect');
        }
        if (strlen($new) < 4) {
            throw new HttpException(400, 'New password must be at least 4 characters');
        }

        $customer->password = Hash::make($new);
        $customer->save();

        return response()->json(['ok' => true, 'detail' => 'Password updated']);
    }

    public function history(Request $request)
    {
        $shopId = (int) $request->input('shop_id');
        $phone = trim($request->input('phone', ''));
        $telegram = trim($request->input('telegram', ''));

        $query = Order::with(['items', 'shop'])->where('shop_id', $shopId);

        if ($phone && $telegram) {
            $query->where(function ($q) use ($phone, $telegram) {
                $q->where('customer_phone', $phone)->orWhere('customer_telegram', $telegram);
            });
        } elseif ($phone) {
            $query->where('customer_phone', $phone);
        } elseif ($telegram) {
            $query->where('customer_telegram', $telegram);
        } else {
            return response()->json([]);
        }

        $orders = $query->orderBy('id', 'desc')->get();

        return response()->json($orders->map(fn ($o) => $o->to_dict())->toArray());
    }

    public function customerMyOrders(Request $request)
    {
        $customer = $request->attributes->get('customer');
        if (! $customer) {
            throw new HttpException(401, 'Customer not authenticated');
        }

        $query = Order::with(['items', 'shop'])->where('shop_id', $customer->shop_id)
            ->where(function ($q) use ($customer) {
                $q->where('customer_id', $customer->id);

                $legacyConditions = [];
                if (! empty($customer->phone)) {
                    $legacyConditions[] = ['customer_phone', '=', $customer->phone];
                }
                if (! empty($customer->telegram)) {
                    $legacyConditions[] = ['customer_telegram', '=', $customer->telegram];
                }

                if (! empty($legacyConditions)) {
                    $q->orWhere(function ($sub) use ($legacyConditions) {
                        $sub->whereNull('customer_id');
                        $sub->where(function ($inner) use ($legacyConditions) {
                            foreach ($legacyConditions as $idx => $cond) {
                                if ($idx === 0) {
                                    $inner->where($cond[0], $cond[1], $cond[2]);
                                } else {
                                    $inner->orWhere($cond[0], $cond[1], $cond[2]);
                                }
                            }
                        });
                    });
                }
            });

        $orders = $query->orderBy('id', 'desc')->get();

        return response()->json([
            'customer' => $customer->to_dict(),
            'count' => $orders->count(),
            'orders' => $orders->map(fn ($o) => $o->to_dict())->toArray(),
        ]);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id');
        if (! $shopId) {
            throw new HttpException(400, 'shop_id is required');
        }

        ShopHelper::requireShopAccess($shopId, $user);

        $query = Customer::where('shop_id', $shopId);
        $search = trim((string) $request->input('search', ''));
        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('telegram', 'like', "%{$search}%");
            });
        }

        $customers = $query->orderBy('id', 'desc')->get();
        if ($customers->isEmpty()) {
            return response()->json([]);
        }

        $allOrders = Order::where('shop_id', $shopId)
            ->select('id', 'customer_id', 'customer_phone', 'payment_status', 'total')
            ->get();

        $ordersByCustomerId = [];
        $ordersByPhone = [];

        foreach ($allOrders as $o) {
            if ($o->customer_id) {
                $ordersByCustomerId[$o->customer_id][] = $o;
            }
            if (! empty($o->customer_phone)) {
                $ordersByPhone[$o->customer_phone][] = $o;
            }
        }

        $out = [];
        foreach ($customers as $c) {
            $matchedOrders = [];
            if (! empty($ordersByCustomerId[$c->id])) {
                foreach ($ordersByCustomerId[$c->id] as $o) {
                    $matchedOrders[$o->id] = $o;
                }
            }
            if (! empty($c->phone) && ! empty($ordersByPhone[$c->phone])) {
                foreach ($ordersByPhone[$c->phone] as $o) {
                    $matchedOrders[$o->id] = $o;
                }
            }

            $orderCount = count($matchedOrders);
            $spent = 0.0;
            foreach ($matchedOrders as $o) {
                if ($o->payment_status === 'paid') {
                    $spent += (float) $o->total;
                }
            }

            $d = $c->to_dict();
            $d['order_count'] = $orderCount;
            $d['total_spent'] = round($spent, 2);
            $out[] = $d;
        }

        return response()->json($out);
    }

    public function getCustomer(Request $request, int $customerId)
    {
        $user = $request->user();
        $customer = Customer::find($customerId);
        if (! $customer) {
            throw new HttpException(404, 'Customer not found');
        }

        ShopHelper::requireShopAccess($customer->shop_id, $user);

        $orders = Order::with(['items', 'shop'])
            ->where('shop_id', $customer->shop_id)
            ->where(function ($q) use ($customer) {
                $q->where('customer_id', $customer->id);
                if (! empty($customer->phone)) {
                    $q->orWhere('customer_phone', $customer->phone);
                }
            })
            ->orderBy('id', 'desc')
            ->get();

        $d = $customer->to_dict();
        $d['orders'] = $orders->map(fn ($o) => $o->to_dict())->toArray();

        return response()->json($d);
    }

    public function store(StoreCustomerRequest $request)
    {
        $user = $request->user();
        $shopId = (int) $request->input('shop_id');
        ShopHelper::requireShopAccess($shopId, $user);

        $customer = Customer::create([
            'shop_id' => $shopId,
            'name' => $request->input('name', ''),
            'phone' => $request->input('phone', ''),
            'telegram' => $request->input('telegram', ''),
            'email' => $request->input('email', ''),
            'address' => $request->input('address', ''),
            'city' => $request->input('city', ''),
            'country' => $request->input('country', ''),
            'notes' => $request->input('notes', ''),
        ]);

        return response()->json($customer->to_dict());
    }

    public function update(UpdateCustomerRequest $request, int $customerId)
    {
        $user = $request->user();
        $customer = Customer::find($customerId);
        if (! $customer) {
            throw new HttpException(404, 'Customer not found');
        }

        ShopHelper::requireShopAccess($customer->shop_id, $user);

        $fields = ['name', 'phone', 'telegram', 'email', 'address', 'city', 'country', 'notes'];
        foreach ($fields as $f) {
            if ($request->has($f)) {
                $customer->{$f} = $request->input($f);
            }
        }

        $customer->save();

        return response()->json($customer->to_dict());
    }

    public function destroy(Request $request, int $customerId)
    {
        $user = $request->user();
        $customer = Customer::find($customerId);
        if (! $customer) {
            throw new HttpException(404, 'Customer not found');
        }

        ShopHelper::requireShopAccess($customer->shop_id, $user);

        // Safety rule: Cannot hard delete customer with existing transaction history
        $hasOrders = Order::where('shop_id', $customer->shop_id)
            ->where(function ($q) use ($customer) {
                $q->where('customer_id', $customer->id);
                if (! empty($customer->phone)) {
                    $q->orWhere('customer_phone', $customer->phone);
                }
            })->exists();

        if ($hasOrders) {
            throw new HttpException(400, 'Cannot delete customer who has existing orders. Transaction history must be preserved.');
        }

        $customer->delete();

        return response()->json(['ok' => true]);
    }
}
