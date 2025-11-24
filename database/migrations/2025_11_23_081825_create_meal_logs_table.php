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
        Schema::create('meal_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('child_id');
            $table->date('eaten_at');
            $table->enum('time_of_day', ['pagi', 'siang', 'malam', 'snack'])->nullable();
            $table->text('description');
            $table->text('ingredients')->nullable();
            $table->enum('source', ['ortu', 'kader', 'system'])->default('ortu');
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
        Schema::dropIfExists('meal_logs');
    }
};
