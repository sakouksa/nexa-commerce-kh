<?php

namespace Tests\Feature\Auth;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ActivityLogSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_records_audit_trail_with_ip_and_properties(): void
    {
        $user = User::factory()->create([
            'username' => 'testaudituser',
            'password' => Hash::make('secret123'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        $response = $this->withServerVariables([
            'REMOTE_ADDR' => '103.216.10.5',
            'HTTP_USER_AGENT' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        ])->postJson('/api/auth/login', [
            'username' => 'testaudituser',
            'password' => 'secret123',
        ]);

        $response->assertStatus(200);

        $log = ActivityLog::where('action', 'login')->first();
        $this->assertNotNull($log);
        $this->assertEquals('testaudituser', $log->username);
        $this->assertEquals('103.216.10.5', $log->ip_address);
        $this->assertStringContainsString('Macintosh', $log->user_agent);
        $this->assertEquals('success', $log->status);
        $this->assertEquals('admin', $log->properties['role'] ?? null);
    }

    public function test_failed_login_records_security_event(): void
    {
        $user = User::factory()->create([
            'username' => 'targetuser',
            'password' => Hash::make('secret123'),
            'role' => 'merchant',
            'status' => 'active',
        ]);

        $response = $this->withServerVariables([
            'REMOTE_ADDR' => '192.168.1.100',
            'HTTP_USER_AGENT' => 'UnknownBot/1.0',
        ])->postJson('/api/auth/login', [
            'username' => 'targetuser',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401);

        $log = ActivityLog::where('action', 'failed_login')->first();
        $this->assertNotNull($log);
        $this->assertEquals('targetuser', $log->username);
        $this->assertEquals('192.168.1.100', $log->ip_address);
        $this->assertEquals('failed', $log->status);
    }
}
