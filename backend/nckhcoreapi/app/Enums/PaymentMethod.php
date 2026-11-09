<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case CASH = 'cash';
    case ABA_PAY = 'aba_pay';
    case KHQR = 'khqr';
    case BANK_TRANSFER = 'bank_transfer';
    case CREDIT_CARD = 'credit_card';

    public function label(): string
    {
        return match ($this) {
            self::CASH => 'Cash on Delivery',
            self::ABA_PAY => 'ABA PayWay',
            self::KHQR => 'Bakong KHQR',
            self::BANK_TRANSFER => 'Bank Transfer',
            self::CREDIT_CARD => 'Credit / Debit Card',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
