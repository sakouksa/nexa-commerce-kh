<?php

namespace Tests\Feature;

use App\Exceptions\OrderException;
use App\Exceptions\ShopAccessException;
use App\Models\Shop;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class ComprehensiveHttpStatusTest extends TestCase
{
    public function test_route_not_found_returns_404_with_standard_structure(): void
    {
        $response = $this->getJson('/api/nonexistent-route-for-testing-'.time());

        $response->assertStatus(404)
            ->assertHeader('X-Request-ID')
            ->assertJson([
                'success' => false,
                'status' => 404,
                'error' => 'ROUTE_NOT_FOUND',
            ])
            ->assertJsonStructure([
                'success',
                'status',
                'error',
                'message',
                'detail',
                'errors',
                'request_id',
            ]);
    }

    public function test_validation_error_returns_422_with_field_errors(): void
    {
        $response = $this->postJson('/api/customers/auth/signin', []);

        $response->assertStatus(422)
            ->assertHeader('X-Request-ID')
            ->assertJson([
                'success' => false,
                'status' => 422,
                'error' => 'VALIDATION_ERROR',
            ])
            ->assertJsonStructure([
                'success',
                'status',
                'error',
                'message',
                'detail',
                'errors' => [
                    'shop_id',
                    'identifier',
                    'password',
                ],
                'request_id',
            ]);
    }

    public function test_unauthenticated_request_returns_401(): void
    {
        $response = $this->getJson('/api/orders/all');

        $response->assertStatus(401)
            ->assertHeader('X-Request-ID')
            ->assertJson([
                'success' => false,
                'status' => 401,
            ]);
    }

    public function test_method_not_allowed_returns_405(): void
    {
        // /api/shops is GET, POST without admin/proper auth is not allowed or method mismatch
        Route::get('/api/test-get-only', fn () => response()->json(['ok' => true]));

        $response = $this->postJson('/api/test-get-only', []);

        $response->assertStatus(405)
            ->assertJson([
                'success' => false,
                'status' => 405,
                'error' => 'METHOD_NOT_ALLOWED',
            ]);
    }

    public function test_custom_domain_exceptions_preserve_status_codes(): void
    {
        Route::get('/api/test-order-not-found', function () {
            throw OrderException::notFound(999);
        });

        $response = $this->getJson('/api/test-order-not-found');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'status' => 404,
                'error' => 'NOT_FOUND',
                'message' => 'Order #999 not found.',
            ]);

        Route::get('/api/test-shop-suspended', function () {
            throw ShopAccessException::suspended();
        });

        $suspended = $this->getJson('/api/test-shop-suspended');

        $suspended->assertStatus(403)
            ->assertJson([
                'success' => false,
                'status' => 403,
                'error' => 'FORBIDDEN',
            ]);
    }

    public function test_model_not_found_returns_404_record_not_found(): void
    {
        Route::get('/api/test-model-not-found', function () {
            throw (new ModelNotFoundException())->setModel(Shop::class);
        });

        $response = $this->getJson('/api/test-model-not-found');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'status' => 404,
                'error' => 'RECORD_NOT_FOUND',
            ]);
    }

    public function test_conflict_status_code_409(): void
    {
        Route::get('/api/test-conflict-409', function () {
            throw new HttpException(409, 'Duplicate resource detected.');
        });

        $response = $this->getJson('/api/test-conflict-409');

        $response->assertStatus(409)
            ->assertJson([
                'success' => false,
                'status' => 409,
                'error' => 'CONFLICT',
                'message' => 'Duplicate resource detected.',
            ]);
    }

    public function test_internal_server_error_returns_500_with_safe_structure(): void
    {
        Route::get('/api/test-500-exception', function () {
            throw new \RuntimeException('Database query failed unexpectedly');
        });

        $response = $this->getJson('/api/test-500-exception');

        $response->assertStatus(500)
            ->assertJson([
                'success' => false,
                'status' => 500,
                'error' => 'INTERNAL_SERVER_ERROR',
            ])
            ->assertJsonStructure([
                'success',
                'status',
                'error',
                'message',
                'detail',
                'request_id',
            ]);
    }
}

