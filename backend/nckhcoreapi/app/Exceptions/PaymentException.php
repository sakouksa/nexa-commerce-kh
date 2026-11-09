<?php

namespace App\Exceptions;

use Exception;

class PaymentException extends Exception
{
    public static function failed(string $reason): self
    {
        return new self("Payment failed: {$reason}", 400);
    }

    public static function alreadyPaid(int|string $orderId): self
    {
        return new self("Order #{$orderId} has already been paid.", 422);
    }

    public static function verificationFailed(string $reference): self
    {
        return new self("Payment verification failed for reference: {$reference}", 422);
    }

    public static function refundFailed(string $reason): self
    {
        return new self("Refund failed: {$reason}", 400);
    }
}
