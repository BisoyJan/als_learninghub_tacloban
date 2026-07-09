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
        // ALS Accreditation & Equivalency (A&E) Test results per learner per level.
        Schema::create('als_ae_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('recorded_by')->constrained('users')->cascadeOnDelete();
            $table->enum('level', ['elementary', 'junior_high'])->default('junior_high');
            $table->date('test_date');
            $table->decimal('overall_score', 5, 2)->nullable(); // percentile / rating 0-100
            $table->enum('result', ['passed', 'failed'])->default('failed');
            $table->string('certificate_no')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'level']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('als_ae_results');
    }
};
