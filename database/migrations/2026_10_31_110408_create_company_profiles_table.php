<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('company_profiles')) {
            Schema::create('company_profiles', function (Blueprint $table) {
                $table->id();
                $table->string('legal_name', 200);
                $table->string('display_name', 200);
                $table->string('slug', 220)->unique();
                $table->text('background');
                $table->text('vision');
                $table->text('mission');
                $table->text('address');
                $table->string('phone', 30)->nullable();
                $table->string('email')->nullable();
                $table->string('whatsapp_number', 30)->nullable();
                $table->text('website_url')->nullable();
                $table->json('business_hours')->default('{}');
                $table->boolean('is_published')->default(false);
                $table->foreignId('updated_by')
                    ->nullable()
                    ->constrained('users')
                    ->nullOnDelete();
                $table->timestampsTz();

                $table->index('is_published');
            });
        }
    }

    public function down(): void
    {
        // Intentionally left empty to protect existing tables and data.
    }
};
