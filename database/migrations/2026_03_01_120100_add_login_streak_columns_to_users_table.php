<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'login_streak')) {
                $table->unsignedInteger('login_streak')->default(0)->after('points');
            }

            if (!Schema::hasColumn('users', 'last_login_date')) {
                $table->date('last_login_date')->nullable()->after('login_streak');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'last_login_date')) {
                $table->dropColumn('last_login_date');
            }

            if (Schema::hasColumn('users', 'login_streak')) {
                $table->dropColumn('login_streak');
            }
        });
    }
};
