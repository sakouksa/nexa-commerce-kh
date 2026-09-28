<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case PENDING = 'pending';
    case PAID = 'paid';
    case FAILED = 'failed';
    case REFUNDED = 'refunded';

    public function isPaid(): bool
    {
        return $this === self::PAID;
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
