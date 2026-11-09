<?php

namespace Tests\Unit\Actions;

use App\Support\Money\Money;
use PHPUnit\Framework\TestCase;

class MoneySupportTest extends TestCase
{
    public function test_money_usd_formatting(): void
    {
        $money = Money::usd(10.5);
        $this->assertEquals('$10.50', $money->format());
        $this->assertEquals(10.5, $money->getAmount());
    }

    public function test_money_khr_conversion(): void
    {
        $money = Money::usd(10.0);
        $khr = $money->toKhr();
        $this->assertEquals('KHR', $khr->getCurrency());
        $this->assertEquals(41000.0, $khr->getAmount());
    }
}
