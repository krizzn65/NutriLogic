<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserBadge;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class PointsService
{
    /**
     * Add points to user and check for badges
     */
    public function addPoints(User $user, int $points, string $activity): void
    {
        if ($points <= 0) {
            return;
        }

        // Update user points
        $user->increment('points', $points);

        // Check and award badges after activity
        $this->checkBadgesAfterActivity($user, $activity);
    }

    /**
     * Check and award badge if user doesn't have it yet
     */
    public function checkAndAwardBadge(User $user, string $badgeCode, string $badgeName, string $badgeDescription): bool
    {
        // Check if user already has this badge
        if ($user->hasBadge($badgeCode)) {
            return false;
        }

        // Create badge
        UserBadge::create([
            'user_id' => $user->id,
            'badge_code' => $badgeCode,
            'earned_at' => now(),
        ]);

        return true;
    }

    /**
     * Get all badge definitions
     */
    public function getBadgeDefinitions(): array
    {
        return [
            [
                'code' => 'first_login',
                'name' => 'Pendatang Baru',
                'description' => 'Login pertama kali',
                'icon' => '🌟',
            ],
            [
                'code' => 'meal_logger_10',
                'name' => 'Pencatat Makanan',
                'description' => 'Mencatat 10 kali log makanan',
                'icon' => '🍽️',
            ],
            [
                'code' => 'meal_logger_50',
                'name' => 'Ahli Nutrisi',
                'description' => 'Mencatat 50 kali log makanan',
                'icon' => '🥗',
            ],
            [
                'code' => 'meal_logger_100',
                'name' => 'Master Nutrisi',
                'description' => 'Mencatat 100 kali log makanan',
                'icon' => '👑',
            ],
            [
                'code' => 'daily_login_7',
                'name' => 'Konsisten',
                'description' => 'Login 7 hari berturut-turut',
                'icon' => '🔥',
            ],
            [
                'code' => 'daily_login_30',
                'name' => 'Dedikasi Tinggi',
                'description' => 'Login 30 hari berturut-turut',
                'icon' => '💎',
            ],
            [
                'code' => 'weighing_logger_10',
                'name' => 'Pemantau Aktif',
                'description' => 'Mencatat 10 kali penimbangan',
                'icon' => '📊',
            ],
            [
                'code' => 'consultation_active',
                'name' => 'Aktif Konsultasi',
                'description' => 'Mengirim 10 pesan konsultasi',
                'icon' => '💬',
            ],
        ];
    }

    /**
     * Check and award badges after specific activity
     */
    public function checkBadgesAfterActivity(User $user, string $activity): void
    {
        switch ($activity) {
            case 'login':
                $this->checkLoginBadges($user);
                break;
            case 'meal_log':
                $this->checkMealLogBadges($user);
                break;
            case 'weighing_log':
                $this->checkWeighingLogBadges($user);
                break;
            case 'consultation_message':
                $this->checkConsultationBadges($user);
                break;
        }
    }

    /**
     * Check badges related to login activity
     */
    private function checkLoginBadges(User $user): void
    {
        // First login badge
        if (!$user->hasBadge('first_login')) {
            $this->checkAndAwardBadge($user, 'first_login', 'Pendatang Baru', 'Login pertama kali');
        }

        // Daily login points (only once per day)
        $lastLoginDate = Cache::get("user_last_login_{$user->id}");
        $today = Carbon::today()->toDateString();

        if ($lastLoginDate !== $today) {
            // Add 2 points for daily login
            $user->increment('points', 2);
            Cache::put("user_last_login_{$user->id}", $today, now()->addDay());

            // Check consecutive login badges
            $this->checkConsecutiveLoginBadges($user);
        }
    }

    /**
     * Check consecutive login badges
     */
    private function checkConsecutiveLoginBadges(User $user): void
    {
        $consecutiveDays = $this->getConsecutiveLoginDays($user);

        if ($consecutiveDays >= 7 && !$user->hasBadge('daily_login_7')) {
            $this->checkAndAwardBadge($user, 'daily_login_7', 'Konsisten', 'Login 7 hari berturut-turut');
        }

        if ($consecutiveDays >= 30 && !$user->hasBadge('daily_login_30')) {
            $this->checkAndAwardBadge($user, 'daily_login_30', 'Dedikasi Tinggi', 'Login 30 hari berturut-turut');
        }
    }

    /**
     * Get consecutive login days (simplified version using cache)
     */
    private function getConsecutiveLoginDays(User $user): int
    {
        $consecutiveKey = "user_consecutive_login_{$user->id}";
        $lastLoginKey = "user_last_login_{$user->id}";
        
        $lastLoginDate = Cache::get($lastLoginKey);
        $consecutiveDays = Cache::get($consecutiveKey, 0);
        $today = Carbon::today();

        if (!$lastLoginDate) {
            // First login
            Cache::put($consecutiveKey, 1, now()->addDays(2));
            return 1;
        }

        $lastLogin = Carbon::parse($lastLoginDate);
        $daysDiff = $today->diffInDays($lastLogin);

        if ($daysDiff === 1) {
            // Consecutive login
            $consecutiveDays++;
            Cache::put($consecutiveKey, $consecutiveDays, now()->addDays(2));
        } elseif ($daysDiff > 1) {
            // Break in streak
            Cache::put($consecutiveKey, 1, now()->addDays(2));
            $consecutiveDays = 1;
        }

        return $consecutiveDays;
    }

    /**
     * Check badges related to meal log activity
     */
    private function checkMealLogBadges(User $user): void
    {
        $mealLogCount = $user->children()
            ->withCount('mealLogs')
            ->get()
            ->sum('meal_logs_count');

        if ($mealLogCount >= 10 && !$user->hasBadge('meal_logger_10')) {
            $this->checkAndAwardBadge($user, 'meal_logger_10', 'Pencatat Makanan', 'Mencatat 10 kali log makanan');
        }

        if ($mealLogCount >= 50 && !$user->hasBadge('meal_logger_50')) {
            $this->checkAndAwardBadge($user, 'meal_logger_50', 'Ahli Nutrisi', 'Mencatat 50 kali log makanan');
        }

        if ($mealLogCount >= 100 && !$user->hasBadge('meal_logger_100')) {
            $this->checkAndAwardBadge($user, 'meal_logger_100', 'Master Nutrisi', 'Mencatat 100 kali log makanan');
        }
    }

    /**
     * Check badges related to weighing log activity
     */
    private function checkWeighingLogBadges(User $user): void
    {
        $weighingLogCount = $user->children()
            ->withCount('weighingLogs')
            ->get()
            ->sum('weighing_logs_count');

        if ($weighingLogCount >= 10 && !$user->hasBadge('weighing_logger_10')) {
            $this->checkAndAwardBadge($user, 'weighing_logger_10', 'Pemantau Aktif', 'Mencatat 10 kali penimbangan');
        }
    }

    /**
     * Check badges related to consultation activity
     */
    private function checkConsultationBadges(User $user): void
    {
        $messageCount = $user->consultationMessages()->count();

        if ($messageCount >= 10 && !$user->hasBadge('consultation_active')) {
            $this->checkAndAwardBadge($user, 'consultation_active', 'Aktif Konsultasi', 'Mengirim 10 pesan konsultasi');
        }
    }
}

