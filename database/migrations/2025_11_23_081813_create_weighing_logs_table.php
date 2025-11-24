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
        Schema::create('weighing_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('child_id');
            $table->date('measured_at');
            $table->decimal('weight_kg', 4, 1);
            $table->decimal('height_cm', 4, 1)->nullable();
            $table->decimal('muac_cm', 4, 1)->nullable();
            $table->decimal('zscore_wfa', 5, 2)->nullable();
            $table->decimal('zscore_hfa', 5, 2)->nullable();
            $table->decimal('zscore_wfh', 5, 2)->nullable();
            $table->string('nutritional_status', 50)->nullable();
            $table->boolean('is_posyandu_day')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('child_id')
                ->references('id')
                ->on('children')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('weighing_logs');
    }
};
