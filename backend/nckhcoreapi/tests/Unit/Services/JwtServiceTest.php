<?php

namespace Tests\Unit\Services;

use App\Services\Auth\JwtService;
use Tests\TestCase;

class JwtServiceTest extends TestCase
{
    public function test_jwt_create_and_decode(): void
    {
        $jwt = new JwtService();
        $payload = ['user_id' => 999, 'role' => 'admin'];
        $token = $jwt->createToken($payload, 60);

        $this->assertNotEmpty($token);
        $decoded = $jwt->decodeToken($token);

        $this->assertEquals(999, $decoded['user_id']);
        $this->assertEquals('admin', $decoded['role']);
    }
}
