<?php

namespace App\Http\Controllers;

use App\Helpers\ShopHelper;
use App\Models\Customer;
use App\Models\Shop;
use App\Models\TelegramCode;
use App\Models\User;
use App\Services\JwtService;
use App\Services\TelegramService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AuthController extends Controller
{
    const MAX_FAILED_ATTEMPTS = 3;
    const BASE_LOCK_MINUTES = 5;

    protected JwtService $jwtService;

    public function __construct(JwtService $jwtService)
    {
        $this->jwtService = $jwtService;
    }

    protected function formatLockWait(int $waitSeconds): string
    {
        $m = intdiv($waitSeconds, 60);
        $s = $waitSeconds % 60;
        if ($m && $s) return "{$m} min {$s} sec";
        if ($m) return "{$m} min";
        return "{$s} sec";
    }

    protected function attemptLogin(string $username, string $password): User
    {
        $now = Carbon::now();
        $user = User::where('username', $username)
            ->orWhere('email', $username)
            ->first();

        if (!$user) {
            $key = 'login_unknown_' . strtolower(trim($username));
            $ent = Cache::get($key, ['count' => 0, 'locked_until' => 0, 'level' => 0]);
            if ($ent['locked_until'] && time() < $ent['locked_until']) {
                $wait = $ent['locked_until'] - time();
                throw new HttpException(429, "Too many failed attempts. Account is locked — try again in " . $this->formatLockWait($wait) . ".");
            }
            $ent['count']++;
            if ($ent['count'] >= self::MAX_FAILED_ATTEMPTS) {
                $ent['level']++;
                $minutes = self::BASE_LOCK_MINUTES * $ent['level'];
                $ent['locked_until'] = time() + ($minutes * 60);
                $ent['count'] = 0;
                Cache::put($key, $ent, $minutes * 60);
                throw new HttpException(429, "Too many failed attempts. Account locked for {$minutes} minutes — try again later.");
            }
            Cache::put($key, $ent, 3600);
            $remaining = self::MAX_FAILED_ATTEMPTS - $ent['count'];
            $nextLock = self::BASE_LOCK_MINUTES * ($ent['level'] + 1);
            throw new HttpException(401, "Invalid username or password — {$remaining} attempt(s) left, then your account is locked for {$nextLock} minutes.");
        }

        // Check if locked
        if ($user->login_locked_until && $user->login_locked_until->isFuture()) {
            $wait = $user->login_locked_until->diffInSeconds($now);
            throw new HttpException(429, "Too many failed attempts. Account is locked — try again in " . $this->formatLockWait($wait) . ".");
        }

        if ($user->login_locked_until && $user->login_locked_until->isPast()) {
            $user->login_locked_until = null;
            $user->login_failed_count = 0;
            $user->save();
        }

        if (!Hash::check($password, $user->password)) {
            $user->login_failed_count = ($user->login_failed_count ?? 0) + 1;
            if ($user->login_failed_count >= self::MAX_FAILED_ATTEMPTS) {
                $user->login_locked_count = ($user->login_locked_count ?? 0) + 1;
                $minutes = self::BASE_LOCK_MINUTES * ($user->login_locked_count ?: 1);
                $user->login_locked_until = $now->copy()->addMinutes($minutes);
                $user->login_failed_count = 0;
                $user->save();
                throw new HttpException(429, "Too many failed attempts. Account locked for {$minutes} minutes — try again later.");
            }
            $remaining = self::MAX_FAILED_ATTEMPTS - $user->login_failed_count;
            $nextMinutes = self::BASE_LOCK_MINUTES * (($user->login_locked_count ?? 0) + 1);
            $user->save();
            throw new HttpException(401, "Invalid username or password — {$remaining} attempt(s) left, then your account is locked for {$nextMinutes} minutes.");
        }

        // Login success
        $user->login_failed_count = 0;
        $user->login_locked_until = null;
        $user->save();

        return $user;
    }

    public function login(\App\Http\Requests\Auth\LoginRequest $request)
    {
        $username = trim($request->input('username', ''));
        $password = $request->input('password', '');

        $user = $this->attemptLogin($username, $password);
        if ($user->status !== 'active') {
            throw new HttpException(403, 'Account is suspended. Contact admin via Telegram @your_telegram');
        }

        $token = $this->jwtService->createToken([
            'sub' => (string) $user->id,
            'role' => $user->role,
        ]);

        ShopHelper::logActivity('login', "{$user->username} logged in", $user->shop_id, $user);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email ?? '',
                'role' => $user->role,
                'shop_id' => $user->shop_id,
                'status' => $user->status,
            ],
        ]);
    }

    public function loginOauth2(Request $request)
    {
        $username = trim($request->input('username', ''));
        $password = $request->input('password', '');
        $user = $this->attemptLogin($username, $password);

        if ($user->status !== 'active') {
            throw new HttpException(403, 'Account is suspended');
        }

        $token = $this->jwtService->createToken([
            'sub' => (string) $user->id,
            'role' => $user->role,
        ]);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
        ]);
    }

    public function register(Request $request)
    {
        $admin = $request->user();
        $username = trim($request->input('username', ''));
        $email = trim($request->input('email', ''));
        $password = $request->input('password', '');
        $role = $request->input('role', 'shop_owner');
        $shopId = $request->input('shop_id');
        $shopUsername = trim($request->input('shop_username', ''));
        $shopName = trim($request->input('shop_name', ''));

        if (!$username || !$password) {
            throw new HttpException(400, 'Username and password are required');
        }
        if (User::where('username', $username)->exists()) {
            throw new HttpException(400, 'Username already exists');
        }

        if ($shopUsername || $shopName) {
            $shop = Shop::where('username', $shopUsername)->first();
            if (!$shop && $shopUsername) {
                $shop = Shop::create([
                    'username' => $shopUsername,
                    'shop_name' => $shopName ?: $shopUsername,
                ]);
            }
            if ($shop) {
                $shopId = $shop->id;
            }
        }

        $user = User::create([
            'username' => $username,
            'email' => $email,
            'password' => Hash::make($password),
            'role' => in_array($role, ['admin', 'shop_owner', 'staff', 'reseller']) ? $role : 'shop_owner',
            'shop_id' => $shopId,
        ]);

        ShopHelper::logActivity('create_user', "Admin created user {$user->username} (role={$user->role})", $shopId, $admin);

        $token = $this->jwtService->createToken([
            'sub' => (string) $user->id,
            'role' => $user->role,
        ]);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email ?? '',
                'role' => $user->role,
                'shop_id' => $user->shop_id,
                'status' => $user->status,
            ],
        ]);
    }

    public function changePassword(Request $request)
    {
        $user = $request->user();
        $currentPassword = $request->input('current_password', '');
        $newPassword = $request->input('new_password', '');

        if (!Hash::check($currentPassword, $user->password)) {
            throw new HttpException(400, 'Current password is incorrect');
        }
        if (strlen($newPassword) < 4) {
            throw new HttpException(400, 'New password must be at least 4 characters');
        }

        $user->password = Hash::make($newPassword);
        $user->save();

        return response()->json(['ok' => true, 'detail' => 'Password updated']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email ?? '',
            'role' => $user->role,
            'shop_id' => $user->shop_id,
            'status' => $user->status,
        ]);
    }

    public function listUsers(Request $request)
    {
        $users = User::with('shop')->orderBy('id')->get();
        return response()->json($users->map(fn($u) => $u->to_dict())->toArray());
    }

    public function updateUser(Request $request, int $userId)
    {
        $admin = $request->user();
        $user = User::find($userId);
        if (!$user) {
            throw new HttpException(404, 'User not found');
        }

        if ($request->has('email')) $user->email = $request->input('email');
        if ($request->has('role')) $user->role = $request->input('role');
        if ($request->has('shop_id')) $user->shop_id = $request->input('shop_id');
        if ($request->has('status')) $user->status = $request->input('status');
        if ($request->filled('password')) {
            $user->password = Hash::make($request->input('password'));
        }

        $user->save();
        ShopHelper::logActivity('update_user', "Admin updated user {$user->username}", $user->shop_id, $admin);

        return response()->json(['ok' => true]);
    }

    public function deleteUser(Request $request, int $userId)
    {
        $admin = $request->user();
        $user = User::find($userId);
        if (!$user) {
            throw new HttpException(404, 'User not found');
        }
        if ($user->role === 'admin' && $user->id === $admin->id) {
            throw new HttpException(400, 'You cannot delete your own admin account');
        }

        $user->delete();
        return response()->json(['ok' => true]);
    }

    // --- Telegram Customer Auth ---

    public function telegramLogin(Request $request)
    {
        $shopId = (int) $request->input('shop_id');
        $tgId = (int) $request->input('id');

        $shop = Shop::find($shopId);
        if (!$shop || $shop->status !== 'active') {
            throw new HttpException(404, 'Shop not found');
        }

        $tg = $shop->telegram_dict();
        $botToken = trim($tg['bot_token'] ?? '');
        if (empty($botToken)) {
            throw new HttpException(400, 'Telegram login is not enabled for this shop yet');
        }

        $authPayload = $request->all();
        unset($authPayload['shop_id']);

        if (!TelegramService::verifyTelegramLogin($botToken, $authPayload)) {
            throw new HttpException(401, 'Telegram authentication failed');
        }

        $username = $request->input('username', '');
        $firstName = $request->input('first_name', '');
        $lastName = $request->input('last_name', '');

        $telegramHandle = $username ? "@{$username}" : "tg{$tgId}";
        $displayName = trim("{$firstName} {$lastName}") ?: "User {$tgId}";

        $customer = Customer::where('shop_id', $shop->id)
            ->where('telegram_id', $tgId)
            ->first();

        if (!$customer) {
            $customer = Customer::create([
                'shop_id' => $shop->id,
                'name' => $displayName,
                'telegram' => $telegramHandle,
                'telegram_id' => $tgId,
                'notes' => "Telegram login · tg://user?id={$tgId}",
            ]);
        } else {
            $customer->name = $displayName;
            if ($username) {
                $customer->telegram = $telegramHandle;
            }
            $customer->save();
        }

        $token = $this->jwtService->createToken([
            'sub' => (string) $customer->id,
            'role' => 'customer',
            'shop_id' => $shop->id,
            'tg_id' => $tgId,
        ]);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'customer' => $customer->to_dict(),
        ]);
    }

    public function requestTelegramCode(Request $request)
    {
        $shopId = (int) $request->input('shop_id');
        $telegramId = (int) $request->input('telegram_id');

        $shop = Shop::find($shopId);
        if (!$shop || $shop->status !== 'active') {
            throw new HttpException(404, 'Shop not found');
        }

        $tg = $shop->telegram_dict();
        $botToken = trim($tg['bot_token'] ?? '');
        if (empty($botToken)) {
            throw new HttpException(400, 'Telegram login is not enabled for this shop yet');
        }

        $code = (string) random_int(100000, 999999);

        TelegramCode::where('shop_id', $shop->id)
            ->where('telegram_id', $telegramId)
            ->delete();

        TelegramCode::create([
            'shop_id' => $shop->id,
            'telegram_id' => $telegramId,
            'code_hash' => hash('sha256', $code),
            'expires_at' => Carbon::now()->addMinutes(5),
        ]);

        $ok = TelegramService::sendVerificationCode($botToken, $telegramId, $code);
        if (!$ok) {
            $botUsername = TelegramService::getBotUsername($botToken) ?: 'the bot';
            throw new HttpException(400, "Could not send the code. The customer must open @{$botUsername} in Telegram and press Start first.");
        }

        return response()->json(['ok' => true, 'detail' => 'Verification code sent to your Telegram']);
    }

    public function verifyTelegramCode(Request $request)
    {
        $shopId = (int) $request->input('shop_id');
        $telegramId = (int) $request->input('telegram_id');
        $code = trim($request->input('code', ''));

        $shop = Shop::find($shopId);
        if (!$shop || $shop->status !== 'active') {
            throw new HttpException(404, 'Shop not found');
        }

        $record = TelegramCode::where('shop_id', $shop->id)
            ->where('telegram_id', $telegramId)
            ->first();

        if (!$record) {
            throw new HttpException(400, 'No code was requested. Please request a new code.');
        }
        if ($record->expires_at && $record->expires_at->isPast()) {
            throw new HttpException(400, 'The code has expired. Please request a new code.');
        }
        if ($record->code_hash !== hash('sha256', $code)) {
            throw new HttpException(401, 'Invalid verification code');
        }

        $record->delete();

        $customer = Customer::where('shop_id', $shop->id)
            ->where('telegram_id', $telegramId)
            ->first();

        if (!$customer) {
            $customer = Customer::create([
                'shop_id' => $shop->id,
                'name' => "User {$telegramId}",
                'telegram' => "tg{$telegramId}",
                'telegram_id' => $telegramId,
                'notes' => "Telegram login (code) · tg://user?id={$telegramId}",
            ]);
        }

        $token = $this->jwtService->createToken([
            'sub' => (string) $customer->id,
            'role' => 'customer',
            'shop_id' => $shop->id,
            'tg_id' => $telegramId,
        ]);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'customer' => $customer->to_dict(),
        ]);
    }

    public function telegramMe(Request $request)
    {
        $customer = $request->attributes->get('customer');
        if (!$customer) {
            throw new HttpException(401, 'Customer not found');
        }
        return response()->json($customer->to_dict());
    }

    public function telegramMiniLogin(Request $request)
    {
        $shopId = (int) $request->input('shop_id');
        $initData = (string) $request->input('init_data', '');

        $shop = Shop::find($shopId);
        if (!$shop || $shop->status !== 'active') {
            throw new HttpException(404, 'Shop not found');
        }

        $tg = $shop->telegram_dict();
        $botToken = trim($tg['bot_token'] ?? '');
        if (!$botToken) {
            throw new HttpException(400, 'Telegram login is not enabled for this shop yet');
        }

        // Parse initData query string: key=value pairs
        parse_str($initData, $params);
        $receivedHash = $params['hash'] ?? '';
        if (!$receivedHash) {
            throw new HttpException(401, 'Invalid Telegram initData');
        }

        // Prepare data_check_string
        unset($params['hash']);
        ksort($params);
        $dataCheckArr = [];
        foreach ($params as $k => $v) {
            $dataCheckArr[] = "{$k}={$v}";
        }
        $dataCheckString = implode("\n", $dataCheckArr);

        // Telegram Mini App secret key = HMAC-SHA256("WebAppData", botToken)
        $secretKey = hash_hmac('sha256', $botToken, 'WebAppData', true);
        $calcHash = hash_hmac('sha256', $dataCheckString, $secretKey);

        if (!hash_equals($calcHash, $receivedHash)) {
            throw new HttpException(401, 'Telegram verification failed');
        }

        // Parse user json from params
        $userData = isset($params['user']) ? json_decode($params['user'], true) : [];
        $tgId = $userData['id'] ?? null;
        if (!$tgId) {
            throw new HttpException(400, 'Missing Telegram user data');
        }

        $username = $userData['username'] ?? '';
        $firstName = $userData['first_name'] ?? '';
        $lastName = $userData['last_name'] ?? '';
        $displayName = trim("{$firstName} {$lastName}") ?: "User {$tgId}";
        $telegramHandle = $username ? "@{$username}" : "tg{$tgId}";

        $customer = Customer::where('shop_id', $shop->id)
            ->where('telegram_id', $tgId)
            ->first();

        if (!$customer) {
            $customer = Customer::create([
                'shop_id' => $shop->id,
                'name' => $displayName,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'telegram' => $telegramHandle,
                'telegram_username' => $username,
                'telegram_id' => $tgId,
                'notes' => "Telegram Mini App login · tg://user?id={$tgId}",
            ]);
        } else {
            $customer->name = $displayName;
            if ($username) {
                $customer->telegram = $telegramHandle;
                $customer->telegram_username = $username;
            }
            $customer->save();
        }

        $token = $this->jwtService->createToken([
            'sub' => (string) $customer->id,
            'role' => 'customer',
            'shop_id' => $shop->id,
            'tg_id' => $tgId,
        ]);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'customer' => $customer->to_dict(),
        ]);
    }
}

