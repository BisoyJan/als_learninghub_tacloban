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
        // Enrollments: ties a student to a module under a teacher
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('module_id')->constrained('learning_modules')->cascadeOnDelete();
            $table->foreignId('enrolled_by')->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['enrolled', 'in_progress', 'completed', 'dropped'])->default('enrolled');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'module_id']);
        });

        // Progress records: individual milestone/assessment entries per enrollment
        Schema::create('progress_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('recorded_by')->constrained('users')->cascadeOnDelete();
            $table->string('title'); // e.g. "Module 1 Quiz", "Portfolio Review"
            $table->enum('type', ['assessment', 'activity', 'milestone'])->default('activity');
            $table->decimal('score', 5, 2)->nullable(); // percentage 0-100
            $table->decimal('max_score', 8, 2)->nullable();
            $table->text('remarks')->nullable();
            $table->date('recorded_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('progress_records');
        Schema::dropIfExists('enrollments');
    }
};
