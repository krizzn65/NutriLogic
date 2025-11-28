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
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('email_notifications')->default(false);
            $table->boolean('push_notifications')->default(false);
            $table->boolean('sms_notifications')->default(false);
            $table->boolean('marketing_emails')->default(false);
            $table->string('notification_frequency')->default('instant');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'email_notifications',
                'push_notifications',
                'sms_notifications',
                'marketing_emails',
                'notification_frequency',
            ]);
        });
    }
};
