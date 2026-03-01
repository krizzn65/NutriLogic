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
     * Add points with daily cap per activity.
     * Returns true when points are awarded, false when limit is reached.
     */
    public function addPointsWithDailyLimit(User $user, int $points, string $activity, int $dailyLimit): bool
    {
        if ($points <= 0 || $dailyLimit <= 0) {
            return false;
        }

        $key = $this->dailyActivityLimitKey($user->id, $activity);
        $currentCount = (int) Cache::get($key, 0);

        if ($currentCount >= $dailyLimit) {
            return false;
        }

        Cache::put($key, $currentCount + 1, now()->endOfDay());
        $this->addPoints($user, $points, $activity);

        return true;
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
                'code' => 'points_1000',
                'name' => 'Bintang Posyandu',
                'description' => 'Mengumpulkan 1000 poin',
                'icon' => '⭐',
            ],
            [
                'code' => 'points_5000',
                'name' => 'Super Parent',
                'description' => 'Mengumpulkan 5000 poin',
                'icon' => '🦸‍♀️',
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
                'code' => 'early_bird',
                'name' => 'Burung Pagi',
                'description' => 'Login antara jam 05:00 - 07:00 pagi',
                'icon' => '🌅',
            ],
            [
                'code' => 'night_owl',
                'name' => 'Ronda Malam',
                'description' => 'Login antara jam 21:00 - 23:00 malam',
                'icon' => '🦉',
            ],
            [
                'code' => 'weighing_logger_10',
                'name' => 'Pemantau Aktif',
                'description' => 'Mencatat 10 kali penimbangan',
                'icon' => '📊',
            ],
            [
                'code' => 'weighing_logger_50',
                'name' => 'Pemantau Setia',
                'description' => 'Mencatat 50 kali penimbangan',
                'icon' => '📈',
            ],
            [
                'code' => 'consultation_active',
                'name' => 'Aktif Konsultasi',
                'description' => 'Mengirim 10 pesan konsultasi',
                'icon' => '💬',
            ],
            [
                'code' => 'consultation_active_50',
                'name' => 'Teman Curhat',
                'description' => 'Mengirim 50 pesan konsultasi',
                'icon' => '🗣️',
            ],
            [
                'code' => 'weekend_warrior',
                'name' => 'Pejuang Akhir Pekan',
                'description' => 'Login di hari Sabtu atau Minggu',
                'icon' => '🏖️',
            ],
            [
                'code' => 'lunch_time',
                'name' => 'Waktu Makan Siang',
                'description' => 'Login saat jam makan siang (11-13)',
                'icon' => '🍱',
            ],
        ];
    }

    /**
     * Check and award badges after specific activity
     */
    public function checkBadgesAfterActivity(User $user, string $activity): void
    {
        // Always check point milestones
        $this->checkPointBadges($user);

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
     * Check badges related to points
     */
    private function checkPointBadges(User $user): void
    {
        if ($user->points >= 1000 && ! $user->hasBadge('points_1000')) {
            $this->checkAndAwardBadge($user, 'points_1000', 'Bintang Posyandu', 'Mengumpulkan 1000 poin');
        }

        if ($user->points >= 5000 && ! $user->hasBadge('points_5000')) {
            $this->checkAndAwardBadge($user, 'points_5000', 'Super Parent', 'Mengumpulkan 5000 poin');
        }
    }

    /**
     * Check badges related to login activity
     */
    private function checkLoginBadges(User $user): void
    {
        // First login badge
        if (! $user->hasBadge('first_login')) {
            $this->checkAndAwardBadge($user, 'first_login', 'Pendatang Baru', 'Login pertama kali');
        }

        // Time based badges
        $hour = (int) now()->format('H');

        if ($hour >= 5 && $hour < 7 && ! $user->hasBadge('early_bird')) {
            $this->checkAndAwardBadge($user, 'early_bird', 'Burung Pagi', 'Login antara jam 05:00 - 07:00 pagi');
        }

        if ($hour >= 21 && $hour < 23 && ! $user->hasBadge('night_owl')) {
            $this->checkAndAwardBadge($user, 'night_owl', 'Ronda Malam', 'Login antara jam 21:00 - 23:00 malam');
        }

        // Check other time based badges
        $this->checkTimeBasedBadges($user);

        // Daily login points (only once per day), persisted in database.
        $today = Carbon::today()->toDateString();
        $lastLoginDate = $user->last_login_date?->toDateString();

        if ($lastLoginDate !== $today) {
            // Add 2 points for daily login
            $user->increment('points', 2);

            // Check consecutive login badges
            $this->checkConsecutiveLoginBadges($user, $lastLoginDate);

            $user->last_login_date = $today;
            $user->save();
        }
    }

    /**
     * Update consecutive login streak and award related badges
     */
    private function checkConsecutiveLoginBadges(User $user, ?string $previousLoginDate = null): void
    {
        $streak = $this->updateConsecutiveLoginDays($user, $previousLoginDate);

        if ($streak >= 7 && ! $user->hasBadge('daily_login_7')) {
            $this->checkAndAwardBadge($user, 'daily_login_7', 'Konsisten', 'Login 7 hari berturut-turut');
        }

        if ($streak >= 30 && ! $user->hasBadge('daily_login_30')) {
            $this->checkAndAwardBadge($user, 'daily_login_30', 'Dedikasi Tinggi', 'Login 30 hari berturut-turut');
        }
    }

    /**
     * Calculate & persist consecutive login streak
     */
    private function updateConsecutiveLoginDays(User $user, ?string $previousLoginDate = null): int
    {
        $currentStreak = (int) ($user->login_streak ?? 0);
        $today = Carbon::today();

        if (empty($previousLoginDate)) {
            $newStreak = 1;
        } else {
            $lastLogin = Carbon::parse($previousLoginDate);

            if ($lastLogin->isSameDay($today)) {
                $newStreak = max(1, $currentStreak);
            } elseif ($lastLogin->isSameDay($today->copy()->subDay())) {
                $newStreak = $currentStreak > 0 ? $currentStreak + 1 : 2;
            } else {
                $newStreak = 1;
            }
        }

        $user->login_streak = $newStreak;
        $user->save();

        return $newStreak;
    }

    /**
     * Public helper to fetch current consecutive login streak
     */
    public function getConsecutiveLoginDays(User $user): int
    {
        return (int) ($user->login_streak ?? 0);
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

        if ($mealLogCount >= 10 && ! $user->hasBadge('meal_logger_10')) {
            $this->checkAndAwardBadge($user, 'meal_logger_10', 'Pencatat Makanan', 'Mencatat 10 kali log makanan');
        }

        if ($mealLogCount >= 50 && ! $user->hasBadge('meal_logger_50')) {
            $this->checkAndAwardBadge($user, 'meal_logger_50', 'Ahli Nutrisi', 'Mencatat 50 kali log makanan');
        }

        if ($mealLogCount >= 100 && ! $user->hasBadge('meal_logger_100')) {
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

        if ($weighingLogCount >= 10 && ! $user->hasBadge('weighing_logger_10')) {
            $this->checkAndAwardBadge($user, 'weighing_logger_10', 'Pemantau Aktif', 'Mencatat 10 kali penimbangan');
        }

        if ($weighingLogCount >= 50 && ! $user->hasBadge('weighing_logger_50')) {
            $this->checkAndAwardBadge($user, 'weighing_logger_50', 'Pemantau Setia', 'Mencatat 50 kali penimbangan');
        }
    }

    /**
     * Check badges related to consultation activity
     */
    private function checkConsultationBadges(User $user): void
    {
        $messageCount = $user->consultationMessages()->count();

        if ($messageCount >= 10 && ! $user->hasBadge('consultation_active')) {
            $this->checkAndAwardBadge($user, 'consultation_active', 'Aktif Konsultasi', 'Mengirim 10 pesan konsultasi');
        }

        if ($messageCount >= 50 && ! $user->hasBadge('consultation_active_50')) {
            $this->checkAndAwardBadge($user, 'consultation_active_50', 'Teman Curhat', 'Mengirim 50 pesan konsultasi');
        }
    }

    /**
     * Check badges related to time (called from login)
     */
    private function checkTimeBasedBadges(User $user): void
    {
        $hour = (int) now()->format('H');
        $dayOfWeek = now()->dayOfWeek; // 0 (Sunday) - 6 (Saturday)

        // Weekend Warrior (Login on Saturday or Sunday)
        if (($dayOfWeek === 0 || $dayOfWeek === 6) && ! $user->hasBadge('weekend_warrior')) {
            $this->checkAndAwardBadge($user, 'weekend_warrior', 'Pejuang Akhir Pekan', 'Login di hari Sabtu atau Minggu');
        }

        // Lunch Time (Login between 11:00 - 13:00)
        if ($hour >= 11 && $hour < 13 && ! $user->hasBadge('lunch_time')) {
            $this->checkAndAwardBadge($user, 'lunch_time', 'Waktu Makan Siang', 'Login saat jam makan siang (11-13)');
        }
    }

    /**
     * Get total activities count for user
     */
    public function getTotalActivities(User $user): int
    {
        $mealLogCount = $user->children()
            ->withCount('mealLogs')
            ->get()
            ->sum('meal_logs_count');

        $weighingLogCount = $user->children()
            ->withCount('weighingLogs')
            ->get()
            ->sum('weighing_logs_count');

        $messageCount = $user->consultationMessages()->count();

        return $mealLogCount + $weighingLogCount + $messageCount;
    }

    private function dailyActivityLimitKey(int $userId, string $activity): string
    {
        return "points_daily_limit:{$activity}:{$userId}:" . now()->toDateString();
    }
}
