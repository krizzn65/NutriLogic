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
            // Make child_id nullable for general posyandu schedules
            $table->unsignedBigInteger('child_id')->nullable()->change();
            
            // Add posyandu_id for general schedules
            $table->unsignedBigInteger('posyandu_id')->nullable()->after('child_id');
            $table->foreign('posyandu_id')->references('id')->on('posyandus')->onDelete('cascade');
            
            // Add index for better query performance
            $table->index(['posyandu_id', 'type', 'scheduled_for']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('immunization_schedules', function (Blueprint $table) {
            $table->dropForeign(['posyandu_id']);
            $table->dropIndex(['posyandu_id', 'type', 'scheduled_for']);
            $table->dropColumn('posyandu_id');
            
            // Revert child_id to not nullable (may fail if there are null values)
            $table->unsignedBigInteger('child_id')->nullable(false)->change();
        });
    }
};
