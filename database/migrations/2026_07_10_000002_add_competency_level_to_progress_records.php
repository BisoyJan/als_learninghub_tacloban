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
        Schema::table('progress_records', function (Blueprint $table) {
            // ALS competency descriptor band. Auto-derived from score when null.
            $table->enum('competency_level', ['beginning', 'developing', 'proficient', 'mastered'])
                ->nullable()
                ->after('max_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('progress_records', function (Blueprint $table) {
            $table->dropColumn('competency_level');
        });
    }
};
