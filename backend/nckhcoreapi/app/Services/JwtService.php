<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtService
{
    protected string $secret;

    protected string $algorithm;

    protected int $expireMinutes;

    public function __construct()
    {
        $this->secret = (string) (config('services.jwt.secret') ?: env('JWT_SECRET', 'ministorekh-cambodia-secret-key-2026-secure'));
        $this->algorithm = (string) (config('services.jwt.algorithm') ?: env('JWT_ALGORITHM', 'HS256'));
        $this->expireMinutes = (int) (config('services.jwt.expire_minutes') ?: env('JWT_EXPIRE_MINUTES', 10080));
    }

    public function createToken(array $data, ?int $expireMinutes = null): string
    {
        $expireMinutes = $expireMinutes ?? $this->expireMinutes;
        $now = time();
        $payload = array_merge($data, [
            'iat' => $now,
            'exp' => $now + ($expireMinutes * 60),
        ]);

        return JWT::encode($payload, $this->secret, $this->algorithm);
    }

    public function decodeToken(string $token): array
    {
        $decoded = JWT::decode($token, new Key($this->secret, $this->algorithm));

        return (array) $decoded;
    }
}
