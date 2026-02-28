<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('email', 191)->nullable()->unique();
            $table->string('phone', 20)->nullable();
            $table->string('address')->nullable();
            $table->string('rt', 10)->nullable();
            $table->string('rw', 10)->nullable();
            $table->string('password');
            $table->enum('role', ['admin', 'kader', 'ibu'])->default('ibu');
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('posyandu_id')->nullable();
            $table->integer('points')->default(0);
            $table->enum('notification_channel', ['none', 'whatsapp', 'email'])->default('none')->nullable();
            $table->string('profile_photo_path', 2048)->nullable();
            $table->boolean('email_notifications')->default(false);
            $table->boolean('push_notifications')->default(false);
            $table->boolean('sms_notifications')->default(false);
            $table->boolean('marketing_emails')->default(false);
            $table->string('notification_frequency')->default('instant');
            $table->timestamp('last_seen_at')->nullable();
            $table->rememberToken();
            $table->timestamps();

            $table->foreign('posyandu_id')
                ->references('id')
                ->on('posyandus')
                ->onDelete('set null');
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('phone')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
            $table->index('token');
        });

        Schema::create('login_attempts', function (Blueprint $table) {
            $table->id();
            $table->string('identifier');
            $table->string('ip_address', 45);
            $table->string('user_agent')->nullable();
            $table->boolean('successful')->default(false);
            $table->timestamp('attempted_at');
            $table->timestamp('locked_until')->nullable();

            $table->index(['identifier', 'attempted_at']);
            $table->index(['ip_address', 'attempted_at']);
            $table->index('locked_until');
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('login_attempts');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
