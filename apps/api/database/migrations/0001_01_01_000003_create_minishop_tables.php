<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shop_id')->index();
            $table->string('name');
            $table->string('slug')->default('');
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('image')->default('');
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->foreign('shop_id')->references('id')->on('shops')->onDelete('cascade');
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shop_id')->index();
            $table->unsignedBigInteger('category_id')->nullable()->index();
            $table->string('name');
            $table->text('description')->nullable();
            $table->double('price')->default(0);
            $table->double('sale_price')->nullable();
            $table->integer('quantity')->default(0);
            $table->longText('images')->nullable();
            $table->longText('custom_attributes')->nullable();
            $table->longText('variations')->nullable();
            $table->longText('metadata_json')->nullable();
            $table->boolean('featured')->default(false);
            $table->string('status')->default('active'); // active | hidden | draft
            $table->timestamps();

            $table->foreign('shop_id')->references('id')->on('shops')->onDelete('cascade');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
        });

        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shop_id')->index();
            $table->string('first_name')->default('');
            $table->string('last_name')->default('');
            $table->string('gender')->default('');
            $table->string('name')->default('');
            $table->string('username')->default('');
            $table->string('phone')->default('');
            $table->string('email')->default('');
            $table->string('password')->default('');
            $table->string('telegram')->default('');
            $table->string('telegram_username')->default('');
            $table->string('telegram_phone')->default('');
            $table->bigInteger('telegram_id')->nullable()->index();
            $table->string('address')->default('');
            $table->string('city')->default('');
            $table->string('country')->default('');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('shop_id')->references('id')->on('shops')->onDelete('cascade');
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shop_id')->index();
            $table->unsignedBigInteger('customer_id')->nullable()->index();
            $table->string('order_number')->unique()->index();
            $table->string('customer_name')->default('');
            $table->string('customer_email')->default('');
            $table->string('customer_phone')->default('');
            $table->string('customer_telegram')->default('');
            $table->string('customer_address')->default('');
            $table->string('customer_city')->default('');
            $table->string('customer_country')->default('');
            $table->text('customer_note')->nullable();
            $table->double('items_total')->default(0);
            $table->double('shipping_fee')->default(0);
            $table->double('discount')->default(0);
            $table->double('total')->default(0);
            $table->string('currency')->default('USD');
            $table->string('payment_method')->default('aba');
            $table->string('payment_status')->default('pending'); // pending | paid | failed | refunded
            $table->string('transaction_id')->default('');
            $table->longText('payment_detail')->nullable();
            $table->string('order_status')->default('pending'); // pending | processing | shipped | delivered | cancelled
            $table->string('receipt_url')->default('');
            $table->dateTime('paid_at')->nullable();
            $table->timestamps();

            $table->foreign('shop_id')->references('id')->on('shops')->onDelete('cascade');
            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('set null');
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id')->index();
            $table->unsignedBigInteger('product_id')->nullable();
            $table->string('product_name')->default('');
            $table->double('price')->default(0);
            $table->integer('quantity')->default(1);
            $table->longText('variations')->nullable();
            $table->timestamps();

            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
        });

        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shop_id')->nullable()->index();
            $table->string('key')->index();
            $table->longText('value')->nullable();
            $table->timestamps();
        });

        Schema::create('backup_history', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shop_id')->nullable()->index();
            $table->string('filename')->default('');
            $table->string('filepath')->default('');
            $table->string('kind')->default('shop'); // shop | system
            $table->timestamps();
        });

        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shop_id')->nullable()->index();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('username')->default('');
            $table->string('action')->default('');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('telegram_codes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shop_id')->index();
            $table->bigInteger('telegram_id')->index();
            $table->string('code_hash')->default('');
            $table->dateTime('expires_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('telegram_codes');
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('backup_history');
        Schema::dropIfExists('settings');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
    }
};
