<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Services\LoginAttemptService;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Cleanup old login attempts daily
Schedule::call(function () {
    app(LoginAttemptService::class)->cleanOldAttempts();
})->daily()->description('Clean old login attempts');
