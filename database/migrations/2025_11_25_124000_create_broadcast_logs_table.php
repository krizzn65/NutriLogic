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
        Schema::create('broadcast_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('posyandu_id');
            $table->unsignedBigInteger('sender_id'); // kader who sent
            $table->text('message');
            $table->enum('type', ['jadwal_posyandu', 'info_gizi', 'pengumuman_umum', 'lainnya'])->default('pengumuman_umum');
            $table->timestamps();
            
            $table->foreign('posyandu_id')
                ->references('id')
                ->on('posyandus')
                ->onDelete('cascade');
            
            $table->foreign('sender_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('broadcast_logs');
    }
};
