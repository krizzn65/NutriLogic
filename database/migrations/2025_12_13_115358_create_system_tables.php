<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Personal Access Tokens (Sanctum)
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->text('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamps();
        });

        // Broadcast Logs
        Schema::create('broadcast_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('posyandu_id');
            $table->unsignedBigInteger('sender_id');
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

        // Activity Logs
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('action');
            $table->string('model')->nullable();
            $table->unsignedBigInteger('model_id')->nullable();
            $table->text('description');
            $table->string('ip_address')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
        });

        // Notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('type');
            $table->string('title');
            $table->text('message');
            $table->string('link')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            $table->index(['user_id', 'is_read']);
        });

        // Settings
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Insert default settings
        DB::table('settings')->insert([
            [
                'key' => 'app_name',
                'value' => 'NutriLogic',
                'type' => 'string',
                'description' => 'Nama aplikasi',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'maintenance_mode',
                'value' => 'false',
                'type' => 'boolean',
                'description' => 'Mode maintenance untuk menutup akses publik',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'allow_registration',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Izinkan registrasi pengguna baru',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'session_timeout',
                'value' => '60',
                'type' => 'integer',
                'description' => 'Timeout sesi dalam menit',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'max_file_size',
                'value' => '5',
                'type' => 'integer',
                'description' => 'Ukuran file maksimal dalam MB',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('broadcast_logs');
        Schema::dropIfExists('personal_access_tokens');
    }
};
