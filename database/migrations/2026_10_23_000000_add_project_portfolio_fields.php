<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('projects')) {
            Schema::create('projects', function (Blueprint $table): void {
                $table->id();
                $table->string('title', 220);
                $table->string('slug', 240)->unique();
                $table->string('client_name', 200)->nullable();
                $table->string('industry', 150)->nullable();
                $table->string('location', 200)->nullable();
                $table->text('summary')->nullable();
                $table->text('description')->nullable();
                $table->date('completed_on')->nullable();
                $table->boolean('is_featured')->default(false);
                $table->boolean('is_published')->default(false);
                $table->timestampTz('published_at')->nullable();
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestampsTz();
            });
        }

        $missingColumns = array_filter(
            [
                'work_type',
                'start_month',
                'start_year',
                'end_month',
                'end_year',
                'image_path',
            ],
            fn (string $column): bool => ! Schema::hasColumn('projects', $column),
        );

        if ($missingColumns !== []) {
            Schema::table('projects', function (Blueprint $table) use ($missingColumns): void {
                if (in_array('work_type', $missingColumns, true)) {
                    $table->string('work_type', 40)->nullable();
                }
                if (in_array('start_month', $missingColumns, true)) {
                    $table->unsignedSmallInteger('start_month')->nullable();
                }
                if (in_array('start_year', $missingColumns, true)) {
                    $table->unsignedSmallInteger('start_year')->nullable();
                }
                if (in_array('end_month', $missingColumns, true)) {
                    $table->unsignedSmallInteger('end_month')->nullable();
                }
                if (in_array('end_year', $missingColumns, true)) {
                    $table->unsignedSmallInteger('end_year')->nullable();
                }
                if (in_array('image_path', $missingColumns, true)) {
                    $table->string('image_path', 500)->nullable();
                }
            });
        }
    }

    public function down(): void
    {
        // Keep project records and their portfolio metadata if this migration is rolled back.
    }
};
