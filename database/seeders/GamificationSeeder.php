<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserBadge;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class GamificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates user badges based on parent activity/points.
     */
    public function run(): void
    {
        $this->command->info('Creating User Badges...');

        $ratna = User::where('email', 'ratna@gmail.com')->first();
        $wulan = User::where('email', 'wulan@gmail.com')->first();
        $ani = User::where('email', 'ani@gmail.com')->first();
        $kaders = User::where('role', 'kader')->get();

        $badgeCount = 0;

        // ============ RATNA - Active user with many badges ============
        // Points: 5500 -> qualifies for points_1000 and points_5000
        $ratnaBadges = [
            'first_login',
            'points_1000',
            'points_5000',
            'meal_logger_50',
            'daily_login_7',
            'daily_login_30',
            'early_bird',
            'weighing_logger_10',
            'consultation_active',
        ];
        foreach ($ratnaBadges as $badge) {
            UserBadge::create([
                'user_id' => $ratna->id,
                'badge_code' => $badge,
                'earned_at' => Carbon::now()->subDays(rand(1, 60)),
            ]);
            $badgeCount++;
        }

        // ============ WULAN - Medium activity ============
        // Points: 1200 -> qualifies for points_1000
        $wulanBadges = [
            'first_login',
            'points_1000',
            'meal_logger_10',
            'daily_login_7',
            'weighing_logger_10',
        ];
        foreach ($wulanBadges as $badge) {
            UserBadge::create([
                'user_id' => $wulan->id,
                'badge_code' => $badge,
                'earned_at' => Carbon::now()->subDays(rand(1, 45)),
            ]);
            $badgeCount++;
        }

        // ============ ANI - Low activity ============
        // Points: 350 -> no points badge
        $aniBadges = [
            'first_login',
            'meal_logger_10',
        ];
        foreach ($aniBadges as $badge) {
            UserBadge::create([
                'user_id' => $ani->id,
                'badge_code' => $badge,
                'earned_at' => Carbon::now()->subDays(rand(1, 30)),
            ]);
            $badgeCount++;
        }

        // ============ KADERS ============
        foreach ($kaders as $kader) {
            UserBadge::create([
                'user_id' => $kader->id,
                'badge_code' => 'first_login',
                'earned_at' => Carbon::now()->subDays(rand(60, 120)),
            ]);
            UserBadge::create([
                'user_id' => $kader->id,
                'badge_code' => 'consultation_active',
                'earned_at' => Carbon::now()->subDays(rand(10, 30)),
            ]);
            $badgeCount += 2;
        }

        $this->command->info("✓ Created {$badgeCount} User Badges");
        $this->command->info('  - Ratna: 9 badges (most active)');
        $this->command->info('  - Wulan: 5 badges');
        $this->command->info('  - Ani: 2 badges');
    }
}
