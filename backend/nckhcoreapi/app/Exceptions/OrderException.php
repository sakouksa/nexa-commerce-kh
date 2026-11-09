<?php

namespace App\Exceptions;

use Exception;

class OrderException extends Exception
{
    public static function notFound(int|string $id): self
    {
        return new self("Order #{$id} not found.", 404);
    }

    public static function invalidStatusTransition(string $current, string $next): self
    {
        return new self("Cannot change order status from {$current} to {$next}.", 422);
    }

    public static function cannotCancel(int|string $id): self
    {
        return new self("Order #{$id} cannot be cancelled in its current state.", 422);
    }
}
