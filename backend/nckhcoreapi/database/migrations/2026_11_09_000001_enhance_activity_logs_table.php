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
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->string('ip_address', 45)->nullable()->after('description')->index();
            $table->text('user_agent')->nullable()->after('ip_address');
            $table->string('method', 10)->nullable()->after('user_agent');
            $table->string('url', 500)->nullable()->after('method');
            $table->string('status', 20)->default('success')->after('url')->index();
            $table->json('properties')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropIndex(['ip_address']);
            $table->dropIndex(['status']);
            $table->dropColumn([
                'ip_address',
                'user_agent',
                'method',
                'url',
                'status',
                'properties',
            ]);
        });
    }
};

