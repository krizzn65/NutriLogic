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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, boolean, integer, json
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

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
