<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Child;
use App\Models\Posyandu;
use App\Models\WeighingLog;
use App\Models\MealLog;
use App\Models\ImmunizationSchedule;
use App\Models\PmtLog;
use App\Models\Consultation;
use App\Models\ConsultationMessage;
use App\Models\UserBadge;
use App\Models\Notification;
use App\Models\ActivityLog;
use App\Models\BroadcastLog;
use App\Models\VitaminDistribution;
use App\Models\ImmunizationRecord;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * 
     * Test Data Overview:
     * - 2 Posyandus
     * - 6 Users (1 Admin, 2 Kaders, 3 Parents)
     * - 6 Children (2 per parent)
     * 
     * PMT Eligibility Test Scenarios:
     * - Ratna: Both children PMT eligible (>=80%) -> Can test PMT rewards
     * - Wulan: 1 eligible, 1 not -> Mixed scenario
     * - Ani: No children eligible -> Cannot get PMT rewards
     */
    public function run(): void
    {
        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('   NUTRILOGIC DATABASE SEEDER          ');
        $this->command->info('========================================');
        $this->command->info('');

        $this->command->info('Clearing existing data...');
        $this->clearAllData();

        $this->call([
            PosyanduSeeder::class,
            UserSeeder::class,
            ChildSeeder::class,
            HealthSeeder::class,
            MealLogSeeder::class,
            PmtLogSeeder::class,
            ScheduleSeeder::class,
            ConsultationSeeder::class,
            GamificationSeeder::class,
            SystemSeeder::class,
        ]);

        $this->printSummary();
    }

    private function clearAllData(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        ConsultationMessage::truncate();
        Consultation::truncate();
        UserBadge::truncate();
        PmtLog::truncate();
        MealLog::truncate();
        ImmunizationSchedule::truncate();
        ImmunizationRecord::truncate();
        VitaminDistribution::truncate();
        WeighingLog::truncate();
        Child::truncate();
        Notification::truncate();
        ActivityLog::truncate();
        BroadcastLog::truncate();
        User::truncate();
        Posyandu::truncate();

        DB::table('personal_access_tokens')->truncate();

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    private function printSummary(): void
    {
        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('   ✅ SEEDING COMPLETED!               ');
        $this->command->info('========================================');
        $this->command->info('');
        $this->command->info('LOGIN CREDENTIALS:');
        $this->command->info('------------------');
        $this->command->info('');
        $this->command->info('ADMIN:');
        $this->command->info('  Email: admin@nutrilogic.com');
        $this->command->info('  Phone: 081234567890');
        $this->command->info('  Password: Admin123');
        $this->command->info('');
        $this->command->info('KADER 1 (Posyandu Mawar):');
        $this->command->info('  Email: kader@nutrilogic.com');
        $this->command->info('  Phone: 081234567891');
        $this->command->info('  Password: Kader123');
        $this->command->info('');
        $this->command->info('KADER 2 (Posyandu Melati):');
        $this->command->info('  Email: kader2@nutrilogic.com');
        $this->command->info('  Phone: 081234567894');
        $this->command->info('  Password: Kader123');
        $this->command->info('');
        $this->command->info('PARENTS (Password: Parent123):');
        $this->command->info('');
        $this->command->info('  👑 RATNA (Most Active - PMT ELIGIBLE):');
        $this->command->info('     Email: ratna@gmail.com');
        $this->command->info('     Phone: 081234567892');
        $this->command->info('     Points: 5500 | Badges: 9');
        $this->command->info('     Children: 2 (ALL PMT eligible >=80%)');
        $this->command->info('');
        $this->command->info('  ⭐ WULAN (Medium Active - MIXED):');
        $this->command->info('     Email: wulan@gmail.com');
        $this->command->info('     Phone: 081234567893');
        $this->command->info('     Points: 1200 | Badges: 5');
        $this->command->info('     Children: 2 (1 eligible, 1 not)');
        $this->command->info('');
        $this->command->info('  📝 ANI (Less Active - NOT ELIGIBLE):');
        $this->command->info('     Email: ani@gmail.com');
        $this->command->info('     Phone: 081234567895');
        $this->command->info('     Points: 350 | Badges: 2');
        $this->command->info('     Children: 2 (NONE eligible)');
        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('TEST SCENARIOS:');
        $this->command->info('========================================');
        $this->command->info('✓ PMT Rewards: Login as Ratna');
        $this->command->info('✓ Points & Badges: Ratna has most badges');
        $this->command->info('✓ Mixed PMT: Login as Wulan');
        $this->command->info('✓ Low Activity: Login as Ani');
        $this->command->info('✓ Multi-Posyandu: Ani is in Posyandu 2');
        $this->command->info('========================================');
    }
}
