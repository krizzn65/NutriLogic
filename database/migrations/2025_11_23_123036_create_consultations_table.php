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
        Schema::create('consultations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('parent_id');
            $table->unsignedBigInteger('kader_id')->nullable();
            $table->unsignedBigInteger('child_id')->nullable();
            $table->string('title', 255);
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->timestamps();

            $table->foreign('parent_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            $table->foreign('kader_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');

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
        Schema::dropIfExists('consultations');
    }
};
