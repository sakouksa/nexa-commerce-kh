<?php

namespace App\Actions\Auth;

use App\Models\User;
use App\Services\JwtService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\HttpException;

class LoginAction
{
    public function __construct(
        protected JwtService $jwtService
    ) {}

    public function execute(string $username, string $password): array
    {
        $user = User::where('username', $username)
            ->orWhere('email', $username)
            ->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw new HttpException(401, 'Incorrect username or password');
        }

        if ($user->status !== 'active') {
            throw new HttpException(403, 'Account is inactive or suspended');
        }

        $user->last_login = Carbon::now();
        $user->save();

        $token = $this->jwtService->createToken([
            'sub' => (string) $user->id,
            'user_id' => $user->id,
            'role' => $user->role,
            'shop_id' => $user->shop_id,
        ]);

        return [
            'access_token' => $token,
            'token_type' => 'bearer',
            'user' => $user,
        ];
    }
}
