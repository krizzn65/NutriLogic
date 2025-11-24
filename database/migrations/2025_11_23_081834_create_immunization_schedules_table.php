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
        Schema::create('immunization_schedules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('child_id');
            $table->string('title', 150);
            $table->enum('type', ['imunisasi', 'vitamin', 'posyandu'])->default('imunisasi');
            $table->date('scheduled_for');
            $table->date('completed_at')->nullable();
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
        Schema::dropIfExists('immunization_schedules');
    }
};
