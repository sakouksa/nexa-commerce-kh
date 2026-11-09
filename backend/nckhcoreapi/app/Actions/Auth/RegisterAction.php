<?php

namespace App\Actions\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\HttpException;

class RegisterAction
{
    public function execute(array $data): User
    {
        $username = trim($data['username'] ?? '');
        $email = trim($data['email'] ?? '');

        if (User::where('username', $username)->exists()) {
            throw new HttpException(400, 'Username already exists');
        }

        if (!empty($email) && User::where('email', $email)->exists()) {
            throw new HttpException(400, 'Email already exists');
        }

        return User::create([
            'username' => $username,
            'email' => $email,
            'password' => Hash::make($data['password']),
            'full_name' => $data['full_name'] ?? '',
            'role' => $data['role'] ?? 'shop',
            'shop_id' => $data['shop_id'] ?? null,
            'status' => 'active',
        ]);
    }
}
