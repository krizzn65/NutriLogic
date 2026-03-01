<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            if (!Schema::hasColumn('consultations', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        Schema::table('meal_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('meal_logs', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        Schema::table('weighing_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('weighing_logs', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    public function down(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            if (Schema::hasColumn('consultations', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });

        Schema::table('meal_logs', function (Blueprint $table) {
            if (Schema::hasColumn('meal_logs', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });

        Schema::table('weighing_logs', function (Blueprint $table) {
            if (Schema::hasColumn('weighing_logs', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });
    }
};
