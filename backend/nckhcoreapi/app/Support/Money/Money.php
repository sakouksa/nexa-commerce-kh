<?php

namespace App\Support\Money;

class Money
{
    public const DEFAULT_KHR_RATE = 4100;

    public function __construct(
        protected float $amount,
        protected string $currency = 'USD'
    ) {}

    public static function usd(float $amount): self
    {
        return new self($amount, 'USD');
    }

    public static function khr(float $amount): self
    {
        return new self($amount, 'KHR');
    }

    public function getAmount(): float
    {
        return $this->amount;
    }

    public function getCurrency(): string
    {
        return strtoupper($this->currency);
    }

    public function toKhr(float $rate = self::DEFAULT_KHR_RATE): self
    {
        if ($this->currency === 'KHR') {
            return $this;
        }

        $khrAmount = round($this->amount * $rate, -2); // Round to hundreds for Riel
        return new self($khrAmount, 'KHR');
    }

    public function toUsd(float $rate = self::DEFAULT_KHR_RATE): self
    {
        if ($this->currency === 'USD') {
            return $this;
        }

        $usdAmount = round($this->amount / $rate, 2);
        return new self($usdAmount, 'USD');
    }

    public function format(): string
    {
        if ($this->currency === 'KHR') {
            return number_format($this->amount, 0, '.', ',') . ' ៛';
        }

        return '$' . number_format($this->amount, 2, '.', ',');
    }

    public function toArray(): array
    {
        return [
            'amount' => $this->amount,
            'currency' => $this->currency,
            'formatted' => $this->format(),
        ];
    }
}
