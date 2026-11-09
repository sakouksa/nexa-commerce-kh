<?php

namespace App\Exceptions;

use Exception;

class ShopAccessException extends Exception
{
    public static function unauthorized(string $message = 'Unauthorized access to shop.'): self
    {
        return new self($message, 403);
    }

    public static function suspended(): self
    {
        return new self('This shop is currently inactive or suspended.', 403);
    }

    public static function notFound(): self
    {
        return new self('Shop not found.', 404);
    }
}
