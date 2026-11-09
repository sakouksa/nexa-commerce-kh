<?php

namespace App\Exceptions;

use Exception;

class StockException extends Exception
{
    public static function insufficientStock(string $productName, int $available, int $requested): self
    {
        return new self("Insufficient stock for '{$productName}'. Available: {$available}, requested: {$requested}.", 422);
    }

    public static function negativeStockNotAllowed(): self
    {
        return new self("Stock level cannot be negative.", 422);
    }
}
