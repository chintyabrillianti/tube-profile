<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('roles')) {
            Schema::create('roles', function (Blueprint $table): void {
                $table->id();
                $table->string('name', 50)->unique();
                $table->text('description')->nullable();
                $table->timestampsTz();
            });
        }

        if (! Schema::hasTable('user_roles')) {
            Schema::create('user_roles', function (Blueprint $table): void {
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->foreignId('role_id')->constrained()->cascadeOnDelete();
                $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestampTz('assigned_at')->useCurrent();
                $table->primary(['user_id', 'role_id']);
                $table->index('assigned_by');
            });
        }
    }

    public function down(): void
    {
        // Do not drop role tables: they may have predated this migration or contain live assignments.
    }
};
