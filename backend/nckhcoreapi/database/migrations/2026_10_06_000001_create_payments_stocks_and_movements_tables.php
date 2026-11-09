
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('payments')) {
            Schema::create('payments', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('order_id')->index();
                $table->unsignedBigInteger('shop_id')->index();
                $table->string('transaction_id')->default('')->index();
                $table->string('payment_method')->default('aba');
                $table->double('amount')->default(0);
                $table->string('currency')->default('USD');
                $table->string('status')->default('pending');
                $table->longText('payment_detail')->nullable();
                $table->dateTime('paid_at')->nullable();
                $table->timestamps();

                $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
                $table->foreign('shop_id')->references('id')->on('shops')->onDelete('cascade');
            });
        }

        if (!Schema::hasTable('stocks')) {
            Schema::create('stocks', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('shop_id')->index();
                $table->unsignedBigInteger('product_id')->index();
                $table->integer('quantity')->default(0);
                $table->integer('reserved_quantity')->default(0);
                $table->integer('safety_stock')->default(5);
                $table->timestamps();

                $table->foreign('shop_id')->references('id')->on('shops')->onDelete('cascade');
                $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
                $table->unique(['shop_id', 'product_id']);
            });
        }

        if (!Schema::hasTable('stock_movements')) {
            Schema::create('stock_movements', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('shop_id')->index();
                $table->unsignedBigInteger('product_id')->index();
                $table->string('type')->default('adjustment'); // in, out, adjustment, sale, return, reserve, release
                $table->integer('quantity')->default(0);
                $table->integer('before_quantity')->default(0);
                $table->integer('after_quantity')->default(0);
                $table->string('reference_type')->nullable();
                $table->unsignedBigInteger('reference_id')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->foreign('shop_id')->references('id')->on('shops')->onDelete('cascade');
                $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('stocks');
        Schema::dropIfExists('payments');
    }
};
