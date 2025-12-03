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
        Schema::table('weighing_logs', function (Blueprint $table) {
            $table->decimal('head_circumference_cm', 4, 1)->nullable()->after('muac_cm');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('weighing_logs', function (Blueprint $table) {
            $table->dropColumn('head_circumference_cm');
        });
    }
};
