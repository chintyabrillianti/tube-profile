<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('services')) {
            Schema::create('services', function (Blueprint $table) {
                $table->id();
                $table->string('name', 200);
                $table->string('slug', 220)->unique();
                $table->text('summary')->nullable();
                $table->text('description');
                $table->boolean('is_published')->default(false);
                $table->integer('sort_order')->default(0);
                $table->foreignId('created_by')
                    ->nullable()
                    ->constrained('users')
                    ->nullOnDelete();
                $table->foreignId('updated_by')
                    ->nullable()
                    ->constrained('users')
                    ->nullOnDelete();
                $table->timestampsTz();

                $table->index(['is_published', 'sort_order']);
            });
        }
    }

    public function down(): void
    {
        // Intentionally left empty to protect existing tables and data.
    }
};
