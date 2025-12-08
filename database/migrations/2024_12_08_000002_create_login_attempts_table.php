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
        Schema::create('login_attempts', function (Blueprint $table) {
            $table->id();
            $table->string('identifier'); // phone or name
            $table->string('ip_address', 45);
            $table->string('user_agent')->nullable();
            $table->boolean('successful')->default(false);
            $table->timestamp('attempted_at');
            $table->timestamp('locked_until')->nullable();
            
            $table->index(['identifier', 'attempted_at']);
            $table->index(['ip_address', 'attempted_at']);
            $table->index('locked_until');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('login_attempts');
    }
};
