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
        Schema::table('immunization_schedules', function (Blueprint $table) {
            // Change scheduled_for from date to datetime to store time
            $table->datetime('scheduled_for')->change();
            
            // Add location field
            $table->string('location', 200)->nullable()->after('scheduled_for');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('immunization_schedules', function (Blueprint $table) {
            // Revert scheduled_for to date
            $table->date('scheduled_for')->change();
            
            // Remove location field
            $table->dropColumn('location');
        });
    }
};
