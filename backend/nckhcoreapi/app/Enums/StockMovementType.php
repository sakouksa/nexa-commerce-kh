<?php

namespace App\Enums;

enum StockMovementType: string
{
    case IN = 'in';
    case OUT = 'out';
    case ADJUSTMENT = 'adjustment';
    case SALE = 'sale';
    case RETURN = 'return';
    case RESERVE = 'reserve';
    case RELEASE = 'release';

    public function label(): string
    {
        return match ($this) {
            self::IN => 'Stock In',
            self::OUT => 'Stock Out',
            self::ADJUSTMENT => 'Stock Adjustment',
            self::SALE => 'Sale Deduction',
            self::RETURN => 'Customer Return',
            self::RESERVE => 'Stock Reserved',
            self::RELEASE => 'Stock Released',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
