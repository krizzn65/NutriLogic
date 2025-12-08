<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LoginAttemptService
{
    // Configuration
    private const MAX_ATTEMPTS = 5;
    private const LOCKOUT_MINUTES = 15;
    private const TRACKING_WINDOW_MINUTES = 30;

    /**
     * Check if account/IP is locked
     */
    public function isLocked(string $identifier, string $ipAddress): bool
    {
        // Check if identifier is locked
        $identifierLocked = DB::table('login_attempts')
            ->where('identifier', $identifier)
            ->where('locked_until', '>', now())
            ->exists();

        if ($identifierLocked) {
            return true;
        }

        // Check if IP is locked (distributed attack prevention)
        $ipLocked = DB::table('login_attempts')
            ->where('ip_address', $ipAddress)
            ->where('locked_until', '>', now())
            ->exists();

        return $ipLocked;
    }

    /**
     * Get remaining lockout time in minutes
     */
    public function getLockoutTime(string $identifier, string $ipAddress): ?int
    {
        $lockRecord = DB::table('login_attempts')
            ->where(function ($query) use ($identifier, $ipAddress) {
                $query->where('identifier', $identifier)
                      ->orWhere('ip_address', $ipAddress);
            })
            ->where('locked_until', '>', now())
            ->orderBy('locked_until', 'desc')
            ->first();

        if (!$lockRecord) {
            return null;
        }

        return now()->diffInMinutes(Carbon::parse($lockRecord->locked_until));
    }

    /**
     * Record failed login attempt
     */
    public function recordFailedAttempt(string $identifier, string $ipAddress, ?string $userAgent = null): void
    {
        DB::table('login_attempts')->insert([
            'identifier' => $identifier,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'successful' => false,
            'attempted_at' => now(),
        ]);

        // Check if should lock account
        $this->checkAndLockIfNeeded($identifier, $ipAddress);
    }

    /**
     * Record successful login
     */
    public function recordSuccessfulAttempt(string $identifier, string $ipAddress, ?string $userAgent = null): void
    {
        // Clear failed attempts for this identifier
        DB::table('login_attempts')
            ->where('identifier', $identifier)
            ->delete();

        // Record successful login
        DB::table('login_attempts')->insert([
            'identifier' => $identifier,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'successful' => true,
            'attempted_at' => now(),
        ]);
    }

    /**
     * Check failed attempts and lock if needed
     */
    private function checkAndLockIfNeeded(string $identifier, string $ipAddress): void
    {
        $recentAttempts = DB::table('login_attempts')
            ->where('identifier', $identifier)
            ->where('successful', false)
            ->where('attempted_at', '>=', now()->subMinutes(self::TRACKING_WINDOW_MINUTES))
            ->count();

        if ($recentAttempts >= self::MAX_ATTEMPTS) {
            $this->lockAccount($identifier, $ipAddress);
        }

        // Also check IP-based attempts (distributed attack)
        $ipAttempts = DB::table('login_attempts')
            ->where('ip_address', $ipAddress)
            ->where('successful', false)
            ->where('attempted_at', '>=', now()->subMinutes(self::TRACKING_WINDOW_MINUTES))
            ->count();

        if ($ipAttempts >= self::MAX_ATTEMPTS * 2) { // Higher threshold for IP
            $this->lockIP($ipAddress);
        }
    }

    /**
     * Lock account
     */
    private function lockAccount(string $identifier, string $ipAddress): void
    {
        DB::table('login_attempts')
            ->where('identifier', $identifier)
            ->update([
                'locked_until' => now()->addMinutes(self::LOCKOUT_MINUTES),
            ]);
    }

    /**
     * Lock IP address
     */
    private function lockIP(string $ipAddress): void
    {
        DB::table('login_attempts')
            ->where('ip_address', $ipAddress)
            ->update([
                'locked_until' => now()->addMinutes(self::LOCKOUT_MINUTES),
            ]);
    }

    /**
     * Get failed attempts count
     */
    public function getFailedAttempts(string $identifier): int
    {
        return DB::table('login_attempts')
            ->where('identifier', $identifier)
            ->where('successful', false)
            ->where('attempted_at', '>=', now()->subMinutes(self::TRACKING_WINDOW_MINUTES))
            ->count();
    }

    /**
     * Clean old records (run this in scheduled task)
     */
    public function cleanOldAttempts(): void
    {
        DB::table('login_attempts')
            ->where('attempted_at', '<', now()->subDays(7))
            ->delete();
    }

    /**
     * Get max attempts allowed
     */
    public function getMaxAttempts(): int
    {
        return self::MAX_ATTEMPTS;
    }
}
