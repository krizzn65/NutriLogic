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
        Schema::create('children', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('parent_id');
            $table->unsignedBigInteger('posyandu_id');
            $table->string('full_name', 150);
            $table->string('nik', 32)->nullable()->unique();
            $table->date('birth_date');
            $table->enum('gender', ['L', 'P']);
            $table->decimal('birth_weight_kg', 4, 1)->nullable();
            $table->decimal('birth_height_cm', 4, 1)->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('parent_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            $table->foreign('posyandu_id')
                ->references('id')
                ->on('posyandus')
                ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('children');
    }
};
