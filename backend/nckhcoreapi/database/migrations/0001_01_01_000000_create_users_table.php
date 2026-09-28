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
        Schema::create('shops', function (Blueprint $table) {
            $table->id();
            $table->string('username')->unique()->index();
            $table->string('shop_name')->default('');
            $table->string('logo')->default('');
            $table->string('banner')->default('');
            $table->text('bio')->nullable();
            $table->text('description')->nullable();
            $table->text('slideshow')->nullable();
            $table->text('social_media')->nullable();
            $table->text('theme')->nullable();
            $table->text('aba_settings')->nullable();
            $table->text('telegram_settings')->nullable();
            $table->string('currency')->default('USD');
            $table->string('status')->default('active'); // active | suspended | pending
            $table->dateTime('expires_at')->nullable();
            $table->integer('max_products')->nullable();
            $table->integer('max_categories')->nullable();
            $table->string('plan')->default('');
            $table->double('plan_price')->default(0);
            $table->double('plan_discount')->default(0);
            $table->dateTime('plan_started_at')->nullable();
            $table->unsignedBigInteger('reseller_id')->nullable()->index();
            $table->text('contact')->nullable();
            $table->timestamps();
        });

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('username')->unique()->index();
            $table->string('email')->default('');
            $table->string('password');
            $table->string('role')->default('shop_owner'); // admin | shop_owner | staff | reseller
            $table->unsignedBigInteger('shop_id')->nullable()->index();
            $table->string('status')->default('active'); // active | suspended
            $table->string('referral_code')->nullable()->index();
            $table->double('commission_rate')->default(0);
            $table->double('discount_max')->default(1.0);
            $table->double('promo_discount')->default(0);
            $table->string('commission_paid')->default('not_yet'); // not_yet | paid
            $table->dateTime('commission_paid_at')->nullable();
            $table->integer('login_failed_count')->default(0);
            $table->integer('login_locked_count')->default(0);
            $table->dateTime('login_locked_until')->nullable();
            $table->rememberToken();
            $table->timestamps();

            $table->foreign('shop_id')->references('id')->on('shops')->onDelete('cascade');
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
        Schema::dropIfExists('shops');
    }
};
