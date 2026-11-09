<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['username' => 'admin'],
            [
                'email' => 'admin@ministore.kh',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'status' => 'active',
            ]
        );
    }
}
