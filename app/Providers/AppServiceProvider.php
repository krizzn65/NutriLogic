<?php

namespace App\Providers;

use RuntimeException;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $defaultConnection = config('database.default');
        $connection = config("database.connections.{$defaultConnection}", []);
        $driver = $connection['driver'] ?? null;
        $password = $connection['password'] ?? null;

        $requiresPassword = in_array($driver, ['mysql', 'pgsql', 'sqlsrv'], true);
        if (app()->environment('production') && $requiresPassword && empty($password)) {
            throw new RuntimeException('DB_PASSWORD wajib diisi pada environment production.');
        }
    }
}
