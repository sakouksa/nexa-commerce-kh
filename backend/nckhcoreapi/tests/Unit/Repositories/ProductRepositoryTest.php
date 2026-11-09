<?php

namespace Tests\Unit\Repositories;

use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Repositories\Eloquent\ProductRepository;
use Tests\TestCase;

class ProductRepositoryTest extends TestCase
{
    public function test_product_repository_binding(): void
    {
        $repo = app(ProductRepositoryInterface::class);
        $this->assertInstanceOf(ProductRepository::class, $repo);
    }
}
