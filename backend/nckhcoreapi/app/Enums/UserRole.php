<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'admin';
    case SHOP_OWNER = 'shop_owner';
    case STAFF = 'staff';
    case RESELLER = 'reseller';
    case CUSTOMER = 'customer';

    public function isAdmin(): bool
    {
        return $this === self::ADMIN;
    }

    public function isShopOwner(): bool
    {
        return $this === self::SHOP_OWNER;
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
