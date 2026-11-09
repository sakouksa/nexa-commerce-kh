<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class ApiExceptionHandler
{
    /**
     * Render an exception into an HTTP JSON response adhering to the enterprise standard.
     */
    public static function render(Throwable $e, Request $request): ?JsonResponse
    {
        // Only format API requests or requests expecting JSON
        if (! $request->is('api/*') && ! $request->expectsJson()) {
            return null;
        }

        $requestId = $request->header('X-Request-ID')
            ?: $request->attributes->get('request_id')
            ?: ('req_'.Str::random(16));

        $status = 500;
        $error = 'INTERNAL_SERVER_ERROR';
        $message = 'An unexpected server error occurred.';
        $errors = null;
        $detail = null;

        // 1. Request Validation Errors (HTTP 422)
        if ($e instanceof ValidationException) {
            $status = 422;
            $error = 'VALIDATION_ERROR';
            $errors = $e->validator->errors()->toArray();
            $messages = $e->validator->errors()->all();
            $message = ! empty($messages) ? $messages[0] : 'The given data was invalid.';
            $detail = implode('; ', $messages);
        }
        // 2. Authentication Errors (HTTP 401)
        elseif ($e instanceof AuthenticationException) {
            $status = 401;
            $error = 'UNAUTHORIZED';
            $message = $e->getMessage() ?: 'Unauthenticated or invalid token.';
            $detail = $message;
        }
        // 3. Authorization Errors (HTTP 403)
        elseif ($e instanceof AuthorizationException || $e instanceof AccessDeniedHttpException) {
            $status = 403;
            $error = 'FORBIDDEN';
            $message = $e->getMessage() ?: 'Access denied. You do not have permission to access this resource.';
            $detail = $message;
        }
        // 4. Model / Database Record Not Found (HTTP 404)
        elseif ($e instanceof ModelNotFoundException) {
            $status = 404;
            $error = 'RECORD_NOT_FOUND';
            $modelName = class_basename($e->getModel());
            $message = "The requested {$modelName} record was not found.";
            $detail = $message;
        }
        // 5. Route / Endpoint Not Found (HTTP 404)
        elseif ($e instanceof NotFoundHttpException) {
            $status = 404;
            $prev = $e->getPrevious();
            if ($prev instanceof ModelNotFoundException) {
                $error = 'RECORD_NOT_FOUND';
                $modelName = class_basename($prev->getModel());
                $message = "The requested {$modelName} record was not found.";
            } else {
                $error = 'ROUTE_NOT_FOUND';
                $message = $e->getMessage() ?: 'The requested API endpoint was not found.';
            }
            $detail = $message;
        }
        // 6. Method Not Allowed (HTTP 405)
        elseif ($e instanceof MethodNotAllowedHttpException) {
            $status = 405;
            $error = 'METHOD_NOT_ALLOWED';
            $message = 'Method '.$request->method().' is not allowed for this route.';
            $detail = $message;
        }
        // 7. Rate Limiting (HTTP 429)
        elseif ($e instanceof ThrottleRequestsException) {
            $status = 429;
            $error = 'TOO_MANY_REQUESTS';
            $message = 'Too many requests. Please slow down and try again later.';
            $detail = $message;
        }
        // 8. Custom Domain Exceptions with explicit HTTP status codes
        elseif ($e instanceof ShopAccessException || $e instanceof OrderException || $e instanceof StockException || $e instanceof PaymentException) {
            $code = $e->getCode();
            $status = ($code >= 400 && $code < 600) ? (int) $code : 400;
            $error = self::mapStatusToErrorCode($status);
            $message = $e->getMessage();
            $detail = $message;
        }
        // 9. Standard Symfony / Laravel HTTP Exceptions (abort(400, ...), abort(409, ...), etc.)
        elseif ($e instanceof HttpExceptionInterface) {
            $status = $e->getStatusCode();
            $error = self::mapStatusToErrorCode($status);
            $message = $e->getMessage() ?: self::defaultMessageForStatus($status);
            $detail = $message;
        }
        // 10. Database Query Exceptions
        elseif ($e instanceof QueryException) {
            $sqlCode = (string) $e->getCode();
            // Check for unique constraint violation (duplicate key) -> HTTP 409 Conflict
            if ($sqlCode === '23000' || $sqlCode === '23505' || str_contains($e->getMessage(), 'duplicate key') || str_contains($e->getMessage(), 'Duplicate entry')) {
                $status = 409;
                $error = 'CONFLICT';
                $message = 'A record with duplicate data already exists.';
                $detail = $message;
            } else {
                $status = 500;
                $error = 'DATABASE_ERROR';
                Log::error('Database QueryException: '.$e->getMessage(), [
                    'request_id' => $requestId,
                    'sql' => $e->getSql(),
                    'bindings' => $e->getBindings(),
                    'exception' => $e,
                ]);
                $message = config('app.debug')
                    ? $e->getMessage()
                    : 'A database error occurred while processing your request.';
                $detail = $message;
            }
        }
        // 11. Generic Throwable / Internal Server Error (HTTP 500)
        else {
            $code = $e->getCode();
            if (is_int($code) && $code >= 400 && $code < 600) {
                $status = $code;
                $error = self::mapStatusToErrorCode($status);
                $message = $e->getMessage();
            } else {
                $status = 500;
                $error = 'INTERNAL_SERVER_ERROR';
                Log::error('Unhandled API Exception: '.$e->getMessage(), [
                    'request_id' => $requestId,
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'exception' => $e,
                ]);
                $message = config('app.debug')
                    ? $e->getMessage()
                    : 'An unexpected internal server error occurred.';
            }
            $detail = $message;
        }

        if ($detail === null) {
            $detail = $message;
        }

        $payload = [
            'success' => false,
            'status' => $status,
            'error' => $error,
            'message' => $message,
            'detail' => $detail,
            'errors' => $errors,
            'request_id' => $requestId,
        ];

        return response()->json($payload, $status, [
            'X-Request-ID' => $requestId,
            'Content-Type' => 'application/json',
        ]);
    }

    public static function mapStatusToErrorCode(int $status): string
    {
        return match ($status) {
            400 => 'BAD_REQUEST',
            401 => 'UNAUTHORIZED',
            403 => 'FORBIDDEN',
            404 => 'NOT_FOUND',
            405 => 'METHOD_NOT_ALLOWED',
            408 => 'REQUEST_TIMEOUT',
            409 => 'CONFLICT',
            413 => 'FILE_TOO_LARGE',
            422 => 'VALIDATION_ERROR',
            429 => 'TOO_MANY_REQUESTS',
            500 => 'INTERNAL_SERVER_ERROR',
            502 => 'BAD_GATEWAY',
            503 => 'SERVICE_UNAVAILABLE',
            504 => 'GATEWAY_TIMEOUT',
            default => 'ERROR',
        };
    }

    public static function defaultMessageForStatus(int $status): string
    {
        return match ($status) {
            400 => 'Bad Request.',
            401 => 'Unauthorized.',
            403 => 'Access Forbidden.',
            404 => 'Resource Not Found.',
            405 => 'Method Not Allowed.',
            408 => 'Request Timeout.',
            409 => 'Resource Conflict.',
            413 => 'Payload Too Large.',
            422 => 'Unprocessable Entity.',
            429 => 'Too Many Requests.',
            500 => 'Internal Server Error.',
            502 => 'Bad Gateway.',
            503 => 'Service Unavailable.',
            504 => 'Gateway Timeout.',
            default => 'An unexpected error occurred.',
        };
    }
}

