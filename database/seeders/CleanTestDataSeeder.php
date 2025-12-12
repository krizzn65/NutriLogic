<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Child;
use App\Models\Posyandu;
use App\Models\WeighingLog;
use App\Models\MealLog;
use App\Models\ImmunizationSchedule;
use App\Models\PmtLog;
use App\Models\Consultation;
use App\Models\ConsultationMessage;
use App\Models\Article;
use App\Models\UserBadge;
use App\Models\Notification;
use App\Models\ActivityLog;
use App\Models\BroadcastLog;
use App\Models\VitaminDistribution;
use App\Models\ImmunizationRecord;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CleanTestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Creates comprehensive test data for ALL features:
     * - 1 Admin
     * - 2 Kaders (different posyandu)
     * - 15 Parents (for pagination testing)
     * - 25+ Children with various nutritional statuses
     * - PMT logs with various compliance rates (eligible/not eligible)
     * - Complete data for badges, notifications, consultations, etc.
     */
    public function run(): void
    {
        $this->command->info('Clearing existing data...');
        $this->clearAllData();

        $this->command->info('Creating Posyandus...');
        $posyandus = $this->createPosyandus();

        $this->command->info('Creating Users...');
        $users = $this->createUsers($posyandus);

        $this->command->info('Creating Children...');
        $children = $this->createChildren($users, $posyandus);

        $this->command->info('Creating Weighing Logs...');
        $this->createWeighingLogs($children);

        $this->command->info('Creating Meal Logs...');
        $this->createMealLogs($children);

        $this->command->info('Creating PMT Logs...');
        $this->createPmtLogs($children);

        $this->command->info('Creating Posyandu Schedules...');
        $this->createSchedules($posyandus);

        $this->command->info('Creating Vitamin Distributions...');
        $this->createVitaminDistributions($children, $posyandus);

        $this->command->info('Creating Immunization Records...');
        $this->createImmunizationRecords($children, $posyandus);

        $this->command->info('Creating Consultations...');
        $this->createConsultations($users, $children);

        $this->command->info('Creating Articles...');
        $this->createArticles($users);

        $this->command->info('Creating User Badges...');
        $this->createUserBadges($users);

        $this->command->info('Creating Notifications...');
        $this->createNotifications($users);

        $this->command->info('Creating Activity Logs...');
        $this->createActivityLogs($users);

        $this->command->info('Creating Broadcast Logs...');
        $this->createBroadcastLogs($users, $posyandus);

        $this->printSummary($users);
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
        Article::truncate();
        Notification::truncate();
        ActivityLog::truncate();
        BroadcastLog::truncate();
        User::truncate();
        Posyandu::truncate();

        DB::table('personal_access_tokens')->truncate();

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }


    private function createPosyandus(): array
    {
        $posyandu1 = Posyandu::create([
            'name' => 'Posyandu Mawar Sehat',
            'village' => 'Desa Sukamaju',
            'address' => 'Jl. Kesehatan No. 123, RT 01/RW 02',
            'rt_rw' => '01/02',
            'city' => 'Jember',
            'latitude' => -8.1656,
            'longitude' => 113.7028,
            'is_active' => true,
        ]);

        $posyandu2 = Posyandu::create([
            'name' => 'Posyandu Melati Indah',
            'village' => 'Desa Sejahtera',
            'address' => 'Jl. Melati No. 45, RT 03/RW 01',
            'rt_rw' => '03/01',
            'city' => 'Jember',
            'latitude' => -8.1700,
            'longitude' => 113.7100,
            'is_active' => true,
        ]);

        return ['posyandu1' => $posyandu1, 'posyandu2' => $posyandu2];
    }

    private function createUsers(array $posyandus): array
    {
        // Admin
        $admin = User::create([
            'name' => 'Admin NutriLogic',
            'email' => 'admin@nutrilogic.com',
            'phone' => '081234567890',
            'password' => 'Admin123',
            'role' => 'admin',
            'posyandu_id' => null,
            'is_active' => true,
            'points' => 0,
            'last_seen_at' => now(),
        ]);

        // Kader 1 - Posyandu Mawar
        $kader1 = User::create([
            'name' => 'Siti Kader',
            'email' => 'kader@nutrilogic.com',
            'phone' => '081234567891',
            'password' => 'Kader123',
            'role' => 'kader',
            'posyandu_id' => $posyandus['posyandu1']->id,
            'is_active' => true,
            'points' => 500,
            'address' => 'Jl. Posyandu No. 1',
            'rt' => '01',
            'rw' => '02',
            'last_seen_at' => now()->subMinutes(2),
        ]);

        // Kader 2 - Posyandu Melati
        $kader2 = User::create([
            'name' => 'Dewi Kader',
            'email' => 'kader2@nutrilogic.com',
            'phone' => '081234567894',
            'password' => 'Kader123',
            'role' => 'kader',
            'posyandu_id' => $posyandus['posyandu2']->id,
            'is_active' => true,
            'points' => 300,
            'address' => 'Jl. Melati No. 5',
            'rt' => '03',
            'rw' => '01',
            'last_seen_at' => now()->subHours(1),
        ]);

        // Create 15 Parents for pagination testing
        $parents = [];
        $parentNames = [
            ['name' => 'Ratna Dewi', 'email' => 'ratna@gmail.com', 'phone' => '081234567892', 'points' => 1500],
            ['name' => 'Wulan Sari', 'email' => 'wulan@gmail.com', 'phone' => '081234567893', 'points' => 5200],
            ['name' => 'Ani Susanti', 'email' => 'ani@gmail.com', 'phone' => '081234567895', 'points' => 800],
            ['name' => 'Budi Hartono', 'email' => 'budi@gmail.com', 'phone' => '081234567896', 'points' => 350],
            ['name' => 'Citra Lestari', 'email' => 'citra@gmail.com', 'phone' => '081234567897', 'points' => 2100],
            ['name' => 'Dina Permata', 'email' => 'dina@gmail.com', 'phone' => '081234567898', 'points' => 150],
            ['name' => 'Eka Putri', 'email' => 'eka@gmail.com', 'phone' => '081234567899', 'points' => 950],
            ['name' => 'Fitri Handayani', 'email' => 'fitri@gmail.com', 'phone' => '081234567900', 'points' => 3500],
            ['name' => 'Gita Nirmala', 'email' => 'gita@gmail.com', 'phone' => '081234567901', 'points' => 600],
            ['name' => 'Hana Wijaya', 'email' => 'hana@gmail.com', 'phone' => '081234567902', 'points' => 1200],
            ['name' => 'Indah Pertiwi', 'email' => 'indah@gmail.com', 'phone' => '081234567903', 'points' => 450],
            ['name' => 'Juwita Sari', 'email' => 'juwita@gmail.com', 'phone' => '081234567904', 'points' => 2800],
            ['name' => 'Kartini Dewi', 'email' => 'kartini@gmail.com', 'phone' => '081234567905', 'points' => 100],
            ['name' => 'Lina Marlina', 'email' => 'lina@gmail.com', 'phone' => '081234567906', 'points' => 750],
            ['name' => 'Maya Anggraini', 'email' => 'maya@gmail.com', 'phone' => '081234567907', 'points' => 4200],
        ];

        foreach ($parentNames as $index => $data) {
            $posyandu = $index < 10 ? $posyandus['posyandu1'] : $posyandus['posyandu2'];
            $parents[] = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'password' => 'Parent123',
                'role' => 'ibu',
                'posyandu_id' => $posyandu->id,
                'is_active' => true,
                'points' => $data['points'],
                'address' => 'Jl. Contoh No. ' . ($index + 1),
                'rt' => sprintf('%02d', ($index % 5) + 1),
                'rw' => sprintf('%02d', ($index % 3) + 1),
                'last_seen_at' => now()->subMinutes(rand(1, 120)),
            ]);
        }

        return [
            'admin' => $admin,
            'kader1' => $kader1,
            'kader2' => $kader2,
            'parents' => $parents,
        ];
    }


    private function createChildren(array $users, array $posyandus): array
    {
        $children = [];
        
        // Child data with various ages and genders
        $childrenData = [
            // Parent 0 (Ratna) - 3 children, all PMT eligible (>=80%)
            ['parent_idx' => 0, 'name' => 'Ahmad Rizki', 'nik' => '3509010101200001', 'months' => 24, 'gender' => 'L', 'bw' => 3.2, 'bh' => 50.0, 'pmt_type' => 'full'],
            ['parent_idx' => 0, 'name' => 'Siti Aisyah', 'nik' => '3509010101200002', 'months' => 12, 'gender' => 'P', 'bw' => 3.0, 'bh' => 48.5, 'pmt_type' => 'high'],
            ['parent_idx' => 0, 'name' => 'Muhammad Fauzan', 'nik' => '3509010101200003', 'months' => 6, 'gender' => 'L', 'bw' => 3.5, 'bh' => 51.0, 'pmt_type' => 'high'],
            
            // Parent 1 (Wulan) - 3 children, mixed PMT compliance
            ['parent_idx' => 1, 'name' => 'Putri Amelia', 'nik' => '3509010101200004', 'months' => 36, 'gender' => 'P', 'bw' => 3.1, 'bh' => 49.0, 'pmt_type' => 'medium'],
            ['parent_idx' => 1, 'name' => 'Budi Santoso', 'nik' => '3509010101200005', 'months' => 18, 'gender' => 'L', 'bw' => 3.3, 'bh' => 50.5, 'pmt_type' => 'low'],
            ['parent_idx' => 1, 'name' => 'Citra Ayu', 'nik' => '3509010101200006', 'months' => 8, 'gender' => 'P', 'bw' => 2.9, 'bh' => 47.5, 'pmt_type' => 'very_low'],
            
            // Parent 2 (Ani) - 2 children
            ['parent_idx' => 2, 'name' => 'Dimas Pratama', 'nik' => '3509010101200007', 'months' => 30, 'gender' => 'L', 'bw' => 3.4, 'bh' => 51.5, 'pmt_type' => 'full'],
            ['parent_idx' => 2, 'name' => 'Eka Safitri', 'nik' => '3509010101200008', 'months' => 15, 'gender' => 'P', 'bw' => 3.0, 'bh' => 49.0, 'pmt_type' => 'high'],
            
            // Parent 3 (Budi) - 2 children
            ['parent_idx' => 3, 'name' => 'Fajar Nugroho', 'nik' => '3509010101200009', 'months' => 42, 'gender' => 'L', 'bw' => 3.6, 'bh' => 52.0, 'pmt_type' => 'medium'],
            ['parent_idx' => 3, 'name' => 'Gita Permata', 'nik' => '3509010101200010', 'months' => 20, 'gender' => 'P', 'bw' => 3.2, 'bh' => 50.0, 'pmt_type' => 'low'],
            
            // Parent 4 (Citra) - 2 children
            ['parent_idx' => 4, 'name' => 'Hadi Wijaya', 'nik' => '3509010101200011', 'months' => 28, 'gender' => 'L', 'bw' => 3.3, 'bh' => 50.5, 'pmt_type' => 'full'],
            ['parent_idx' => 4, 'name' => 'Intan Sari', 'nik' => '3509010101200012', 'months' => 10, 'gender' => 'P', 'bw' => 2.8, 'bh' => 47.0, 'pmt_type' => 'high'],
            
            // Parent 5 (Dina) - 1 child
            ['parent_idx' => 5, 'name' => 'Joko Susilo', 'nik' => '3509010101200013', 'months' => 48, 'gender' => 'L', 'bw' => 3.5, 'bh' => 51.0, 'pmt_type' => 'very_low'],
            
            // Parent 6 (Eka) - 2 children
            ['parent_idx' => 6, 'name' => 'Kiki Amalia', 'nik' => '3509010101200014', 'months' => 22, 'gender' => 'P', 'bw' => 3.1, 'bh' => 49.5, 'pmt_type' => 'high'],
            ['parent_idx' => 6, 'name' => 'Lukman Hakim', 'nik' => '3509010101200015', 'months' => 9, 'gender' => 'L', 'bw' => 3.4, 'bh' => 50.5, 'pmt_type' => 'full'],
            
            // Parent 7 (Fitri) - 3 children
            ['parent_idx' => 7, 'name' => 'Mega Putri', 'nik' => '3509010101200016', 'months' => 32, 'gender' => 'P', 'bw' => 3.2, 'bh' => 50.0, 'pmt_type' => 'full'],
            ['parent_idx' => 7, 'name' => 'Nanda Pratama', 'nik' => '3509010101200017', 'months' => 16, 'gender' => 'L', 'bw' => 3.3, 'bh' => 50.5, 'pmt_type' => 'high'],
            ['parent_idx' => 7, 'name' => 'Olivia Sari', 'nik' => '3509010101200018', 'months' => 5, 'gender' => 'P', 'bw' => 3.0, 'bh' => 48.0, 'pmt_type' => 'medium'],
            
            // Parent 8 (Gita) - 1 child
            ['parent_idx' => 8, 'name' => 'Putra Mahendra', 'nik' => '3509010101200019', 'months' => 38, 'gender' => 'L', 'bw' => 3.5, 'bh' => 51.5, 'pmt_type' => 'low'],
            
            // Parent 9 (Hana) - 2 children
            ['parent_idx' => 9, 'name' => 'Qori Amelia', 'nik' => '3509010101200020', 'months' => 26, 'gender' => 'P', 'bw' => 3.1, 'bh' => 49.0, 'pmt_type' => 'full'],
            ['parent_idx' => 9, 'name' => 'Rafi Ahmad', 'nik' => '3509010101200021', 'months' => 11, 'gender' => 'L', 'bw' => 3.2, 'bh' => 49.5, 'pmt_type' => 'high'],
            
            // Parent 10-14 (Posyandu 2) - various children
            ['parent_idx' => 10, 'name' => 'Sinta Dewi', 'nik' => '3509010101200022', 'months' => 34, 'gender' => 'P', 'bw' => 3.3, 'bh' => 50.5, 'pmt_type' => 'full'],
            ['parent_idx' => 10, 'name' => 'Taufik Hidayat', 'nik' => '3509010101200023', 'months' => 14, 'gender' => 'L', 'bw' => 3.4, 'bh' => 51.0, 'pmt_type' => 'medium'],
            ['parent_idx' => 11, 'name' => 'Umi Kalsum', 'nik' => '3509010101200024', 'months' => 40, 'gender' => 'P', 'bw' => 3.2, 'bh' => 50.0, 'pmt_type' => 'high'],
            ['parent_idx' => 12, 'name' => 'Vino Bastian', 'nik' => '3509010101200025', 'months' => 7, 'gender' => 'L', 'bw' => 3.1, 'bh' => 49.0, 'pmt_type' => 'very_low'],
            ['parent_idx' => 13, 'name' => 'Winda Sari', 'nik' => '3509010101200026', 'months' => 19, 'gender' => 'P', 'bw' => 3.0, 'bh' => 48.5, 'pmt_type' => 'low'],
            ['parent_idx' => 14, 'name' => 'Yoga Pratama', 'nik' => '3509010101200027', 'months' => 44, 'gender' => 'L', 'bw' => 3.6, 'bh' => 52.0, 'pmt_type' => 'full'],
            ['parent_idx' => 14, 'name' => 'Zahra Amelia', 'nik' => '3509010101200028', 'months' => 21, 'gender' => 'P', 'bw' => 3.2, 'bh' => 50.0, 'pmt_type' => 'high'],
        ];

        foreach ($childrenData as $data) {
            $parent = $users['parents'][$data['parent_idx']];
            $posyandu = $data['parent_idx'] < 10 ? $posyandus['posyandu1'] : $posyandus['posyandu2'];
            
            $child = Child::create([
                'parent_id' => $parent->id,
                'posyandu_id' => $posyandu->id,
                'full_name' => $data['name'],
                'nik' => $data['nik'],
                'birth_date' => Carbon::now()->subMonths($data['months']),
                'gender' => $data['gender'],
                'birth_weight_kg' => $data['bw'],
                'birth_height_cm' => $data['bh'],
                'notes' => 'Data anak untuk testing',
                'is_active' => true,
            ]);
            
            $child->pmt_type = $data['pmt_type']; // Store for PMT log creation
            $children[] = $child;
        }

        return $children;
    }


    private function createWeighingLogs(array $children): void
    {
        $nutritionalStatuses = ['Gizi Baik', 'Gizi Kurang', 'Gizi Lebih', 'Gizi Buruk', 'Stunting', 'Normal'];
        
        foreach ($children as $child) {
            $ageMonths = Carbon::parse($child->birth_date)->diffInMonths(Carbon::now());
            $baseWeight = $child->birth_weight_kg;
            $baseHeight = $child->birth_height_cm;

            // Create 6 weighing logs per child (monthly for last 6 months)
            for ($i = 5; $i >= 0; $i--) {
                $measuredAt = Carbon::now()->subMonths($i);
                $monthsAtMeasurement = $ageMonths - $i;
                
                if ($monthsAtMeasurement < 0) continue;

                // Simulate realistic growth
                $weight = $baseWeight + ($monthsAtMeasurement * 0.35);
                $height = $baseHeight + ($monthsAtMeasurement * 1.8);

                // Add some variation
                $weight += (rand(-5, 5) / 10);
                $height += (rand(-3, 3) / 10);

                // Determine nutritional status based on child index for variety
                $statusIndex = ($child->id + $i) % count($nutritionalStatuses);
                
                WeighingLog::create([
                    'child_id' => $child->id,
                    'measured_at' => $measuredAt,
                    'weight_kg' => max(2.5, min($weight, 25)),
                    'height_cm' => max(45, min($height, 130)),
                    'muac_cm' => 12.5 + ($monthsAtMeasurement * 0.1) + (rand(-5, 5) / 10),
                    'head_circumference_cm' => 35 + ($monthsAtMeasurement * 0.4),
                    'zscore_wfa' => rand(-20, 20) / 10,
                    'zscore_hfa' => rand(-25, 15) / 10,
                    'zscore_wfh' => rand(-20, 20) / 10,
                    'nutritional_status' => $nutritionalStatuses[$statusIndex],
                    'is_posyandu_day' => $i % 2 === 0,
                    'notes' => "Pemeriksaan rutin bulan " . $measuredAt->format('F Y'),
                ]);
            }
        }
    }

    private function createMealLogs(array $children): void
    {
        $mealDescriptions = [
            'pagi' => [
                'Bubur ayam dengan telur rebus',
                'Nasi tim sayur wortel',
                'Bubur kacang hijau dengan santan',
                'Roti gandum dengan susu',
                'Oatmeal dengan pisang',
                'Nasi goreng telur',
            ],
            'siang' => [
                'Nasi, ayam goreng, sayur bayam',
                'Nasi, ikan bakar, tumis kangkung',
                'Sup ayam sayuran lengkap',
                'Nasi, tempe goreng, sayur sop',
                'Nasi, telur dadar, capcay',
                'Mie goreng dengan sayuran',
            ],
            'malam' => [
                'Bubur sumsum hangat',
                'Nasi lembek dengan lauk ikan',
                'Sup makaroni sayuran',
                'Nasi dengan telur dadar',
                'Bubur ayam',
                'Nasi tim dengan hati ayam',
            ],
            'snack' => [
                'Buah pisang ambon',
                'Biskuit bayi',
                'Puding susu vanilla',
                'Jus buah jeruk',
                'Yogurt dengan buah',
                'Roti dengan selai kacang',
            ],
        ];

        $portions = ['habis', 'setengah', 'sedikit'];
        $sources = ['ortu', 'kader'];

        foreach ($children as $child) {
            // Create 50-100 meal logs per child for comprehensive data
            $numLogs = rand(50, 100);
            
            for ($i = 0; $i < $numLogs; $i++) {
                $daysAgo = rand(0, 60);
                $timeOfDay = array_rand($mealDescriptions);
                $descriptions = $mealDescriptions[$timeOfDay];

                MealLog::create([
                    'child_id' => $child->id,
                    'eaten_at' => Carbon::now()->subDays($daysAgo),
                    'time_of_day' => $timeOfDay,
                    'description' => $descriptions[array_rand($descriptions)],
                    'ingredients' => 'Bahan-bahan segar dan bergizi',
                    'portion' => $portions[array_rand($portions)],
                    'notes' => $i % 5 === 0 ? 'Anak makan dengan lahap' : null,
                    'source' => $sources[array_rand($sources)],
                ]);
            }
        }
    }


    private function createPmtLogs(array $children): void
    {
        // PMT eligibility is based on PREVIOUS month (>=80% consumed = eligible)
        $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth();
        $daysInLastMonth = $startOfLastMonth->daysInMonth;
        
        $this->command->info("Creating PMT logs for: " . $startOfLastMonth->format('F Y') . " ({$daysInLastMonth} days)");

        // PMT compliance types:
        // full = 100% (all days consumed) - ELIGIBLE
        // high = 85-95% - ELIGIBLE
        // medium = 70-79% - NOT ELIGIBLE
        // low = 50-69% - NOT ELIGIBLE
        // very_low = 30-49% - NOT ELIGIBLE

        $eligibleCount = 0;
        $notEligibleCount = 0;

        foreach ($children as $child) {
            $pmtType = $child->pmt_type ?? 'medium';
            
            switch ($pmtType) {
                case 'full':
                    // 100% compliance - all days consumed
                    for ($i = 0; $i < $daysInLastMonth; $i++) {
                        PmtLog::create([
                            'child_id' => $child->id,
                            'date' => $startOfLastMonth->copy()->addDays($i)->format('Y-m-d'),
                            'status' => 'consumed',
                            'notes' => 'Habis semua',
                        ]);
                    }
                    $eligibleCount++;
                    break;

                case 'high':
                    // 85-95% compliance
                    $missedDays = rand(2, 5);
                    $missedIndices = array_rand(range(0, $daysInLastMonth - 1), $missedDays);
                    if (!is_array($missedIndices)) $missedIndices = [$missedIndices];
                    
                    for ($i = 0; $i < $daysInLastMonth; $i++) {
                        if (!in_array($i, $missedIndices)) {
                            PmtLog::create([
                                'child_id' => $child->id,
                                'date' => $startOfLastMonth->copy()->addDays($i)->format('Y-m-d'),
                                'status' => 'consumed',
                                'notes' => 'Makan dengan lahap',
                            ]);
                        }
                    }
                    $eligibleCount++;
                    break;

                case 'medium':
                    // 70-79% compliance - NOT ELIGIBLE
                    $consumedDays = (int)($daysInLastMonth * (rand(70, 79) / 100));
                    $consumedIndices = array_rand(range(0, $daysInLastMonth - 1), $consumedDays);
                    if (!is_array($consumedIndices)) $consumedIndices = [$consumedIndices];
                    
                    for ($i = 0; $i < $daysInLastMonth; $i++) {
                        $status = in_array($i, $consumedIndices) ? 'consumed' : ['partial', 'refused'][rand(0, 1)];
                        PmtLog::create([
                            'child_id' => $child->id,
                            'date' => $startOfLastMonth->copy()->addDays($i)->format('Y-m-d'),
                            'status' => $status,
                            'notes' => $status === 'consumed' ? 'Habis' : 'Tidak mau makan',
                        ]);
                    }
                    $notEligibleCount++;
                    break;

                case 'low':
                    // 50-69% compliance - NOT ELIGIBLE
                    $consumedDays = (int)($daysInLastMonth * (rand(50, 69) / 100));
                    $consumedIndices = array_rand(range(0, $daysInLastMonth - 1), $consumedDays);
                    if (!is_array($consumedIndices)) $consumedIndices = [$consumedIndices];
                    
                    for ($i = 0; $i < $daysInLastMonth; $i++) {
                        if (in_array($i, $consumedIndices)) {
                            PmtLog::create([
                                'child_id' => $child->id,
                                'date' => $startOfLastMonth->copy()->addDays($i)->format('Y-m-d'),
                                'status' => 'consumed',
                                'notes' => 'Makan sedikit',
                            ]);
                        } else {
                            PmtLog::create([
                                'child_id' => $child->id,
                                'date' => $startOfLastMonth->copy()->addDays($i)->format('Y-m-d'),
                                'status' => 'refused',
                                'notes' => 'Menolak makan',
                            ]);
                        }
                    }
                    $notEligibleCount++;
                    break;

                case 'very_low':
                    // 30-49% compliance - NOT ELIGIBLE
                    $consumedDays = (int)($daysInLastMonth * (rand(30, 49) / 100));
                    $consumedIndices = array_rand(range(0, $daysInLastMonth - 1), max(1, $consumedDays));
                    if (!is_array($consumedIndices)) $consumedIndices = [$consumedIndices];
                    
                    for ($i = 0; $i < $daysInLastMonth; $i++) {
                        if (in_array($i, $consumedIndices)) {
                            PmtLog::create([
                                'child_id' => $child->id,
                                'date' => $startOfLastMonth->copy()->addDays($i)->format('Y-m-d'),
                                'status' => rand(0, 1) ? 'consumed' : 'partial',
                                'notes' => 'Porsi tidak habis',
                            ]);
                        }
                    }
                    $notEligibleCount++;
                    break;
            }
        }

        // Also create some PMT logs for current month (partial data)
        $startOfCurrentMonth = Carbon::now()->startOfMonth();
        $currentDay = Carbon::now()->day;
        
        foreach ($children as $child) {
            for ($i = 0; $i < min($currentDay, 15); $i++) {
                if (rand(0, 1)) {
                    PmtLog::create([
                        'child_id' => $child->id,
                        'date' => $startOfCurrentMonth->copy()->addDays($i)->format('Y-m-d'),
                        'status' => ['consumed', 'partial', 'refused'][rand(0, 2)],
                        'notes' => 'Data bulan ini',
                    ]);
                }
            }
        }

        $this->command->info("PMT Eligible (>=80%): {$eligibleCount} children");
        $this->command->info("PMT Not Eligible (<80%): {$notEligibleCount} children");
    }


    private function createSchedules(array $posyandus): void
    {
        // Valid types: 'imunisasi', 'vitamin', 'posyandu'
        $scheduleTemplates = [
            ['title' => 'Posyandu Rutin - Penimbangan & Imunisasi', 'type' => 'posyandu', 'days' => 7],
            ['title' => 'Pemberian Vitamin A', 'type' => 'vitamin', 'days' => 14],
            ['title' => 'Imunisasi Campak & Rubella', 'type' => 'imunisasi', 'days' => 21],
            ['title' => 'Penyuluhan Gizi Seimbang', 'type' => 'posyandu', 'days' => 28],
            ['title' => 'Posyandu Rutin - Pemeriksaan Kesehatan', 'type' => 'posyandu', 'days' => -7],
            ['title' => 'Imunisasi DPT-HB-Hib', 'type' => 'imunisasi', 'days' => 35],
            ['title' => 'Pemeriksaan Tumbuh Kembang', 'type' => 'posyandu', 'days' => 42],
            ['title' => 'Posyandu Rutin Bulanan', 'type' => 'posyandu', 'days' => -14],
        ];

        foreach ($posyandus as $posyandu) {
            foreach ($scheduleTemplates as $template) {
                $scheduledFor = Carbon::now()->addDays($template['days'])->setTime(rand(8, 10), 0);
                $isCompleted = $template['days'] < 0;

                ImmunizationSchedule::create([
                    'child_id' => null,
                    'posyandu_id' => $posyandu->id,
                    'title' => $template['title'],
                    'type' => $template['type'],
                    'scheduled_for' => $scheduledFor,
                    'location' => $posyandu->name,
                    'completed_at' => $isCompleted ? $scheduledFor : null,
                    'notes' => $isCompleted ? 'Sudah dilaksanakan' : 'Harap membawa buku KIA',
                ]);
            }
        }
    }

    private function createVitaminDistributions(array $children, array $posyandus): void
    {
        $vitaminTypes = ['vitamin_a_blue', 'vitamin_a_red'];
        
        foreach ($children as $child) {
            $ageMonths = Carbon::parse($child->birth_date)->diffInMonths(Carbon::now());
            
            // Vitamin A given at 6, 12, 18, 24, 30, 36, 42, 48 months
            $vitaminAges = [6, 12, 18, 24, 30, 36, 42, 48];
            
            foreach ($vitaminAges as $vitaminAge) {
                if ($ageMonths >= $vitaminAge) {
                    $distributionDate = Carbon::parse($child->birth_date)->addMonths($vitaminAge);
                    
                    // Blue for 6-11 months, Red for 12+ months
                    $vitaminType = $vitaminAge < 12 ? 'vitamin_a_blue' : 'vitamin_a_red';
                    
                    VitaminDistribution::create([
                        'child_id' => $child->id,
                        'posyandu_id' => $child->posyandu_id,
                        'vitamin_type' => $vitaminType,
                        'distribution_date' => $distributionDate,
                        'dosage' => $vitaminType === 'vitamin_a_blue' ? '100.000 IU' : '200.000 IU',
                        'notes' => 'Pemberian vitamin rutin',
                    ]);
                }
            }
        }
    }

    private function createImmunizationRecords(array $children, array $posyandus): void
    {
        $immunizationSchedule = [
            ['vaccine' => 'hepatitis_b_0', 'month' => 0],
            ['vaccine' => 'bcg', 'month' => 1],
            ['vaccine' => 'polio_1', 'month' => 1],
            ['vaccine' => 'dpt_hib_hep_b_1', 'month' => 2],
            ['vaccine' => 'polio_2', 'month' => 2],
            ['vaccine' => 'dpt_hib_hep_b_2', 'month' => 3],
            ['vaccine' => 'polio_3', 'month' => 3],
            ['vaccine' => 'dpt_hib_hep_b_3', 'month' => 4],
            ['vaccine' => 'polio_4', 'month' => 4],
            ['vaccine' => 'ipv_1', 'month' => 4],
            ['vaccine' => 'campak_rubella_1', 'month' => 9],
            ['vaccine' => 'ipv_2', 'month' => 9],
            ['vaccine' => 'campak_rubella_2', 'month' => 18],
        ];

        foreach ($children as $child) {
            $ageMonths = Carbon::parse($child->birth_date)->diffInMonths(Carbon::now());
            
            foreach ($immunizationSchedule as $imm) {
                if ($ageMonths >= $imm['month']) {
                    $immunizationDate = Carbon::parse($child->birth_date)->addMonths($imm['month']);
                    
                    ImmunizationRecord::create([
                        'child_id' => $child->id,
                        'posyandu_id' => $child->posyandu_id,
                        'vaccine_type' => $imm['vaccine'],
                        'immunization_date' => $immunizationDate,
                        'batch_number' => 'BATCH-' . strtoupper(substr(md5(rand()), 0, 8)),
                        'notes' => 'Imunisasi rutin',
                    ]);
                }
            }
        }
    }


    private function createConsultations(array $users, array $children): void
    {
        $consultationTopics = [
            'Konsultasi tentang pola makan anak',
            'Pertanyaan tentang berat badan anak',
            'Masalah anak susah makan',
            'Konsultasi imunisasi',
            'Pertanyaan tentang MPASI',
            'Konsultasi tumbuh kembang',
            'Masalah alergi makanan',
            'Pertanyaan tentang vitamin',
        ];

        $parentMessages = [
            'Selamat pagi Bu, saya ingin konsultasi tentang pola makan anak saya.',
            'Bu, anak saya susah makan sayur. Bagaimana solusinya?',
            'Apakah berat badan anak saya sudah ideal untuk usianya?',
            'Kapan jadwal imunisasi selanjutnya untuk anak saya?',
            'Anak saya baru 6 bulan, MPASI apa yang cocok?',
            'Bu, anak saya belum bisa jalan padahal sudah 14 bulan.',
            'Anak saya alergi telur, makanan pengganti apa yang bagus?',
            'Vitamin apa yang bagus untuk meningkatkan nafsu makan?',
        ];

        $kaderResponses = [
            'Selamat pagi Ibu. Untuk pola makan, pastikan anak mendapat gizi seimbang dengan variasi makanan.',
            'Coba variasikan bentuk dan cara penyajian sayur. Bisa dicampur dengan makanan yang disukai anak.',
            'Berdasarkan data penimbangan terakhir, berat badan anak Ibu masih dalam kategori normal.',
            'Jadwal imunisasi selanjutnya adalah pada tanggal yang sudah dijadwalkan. Silakan cek di aplikasi.',
            'Untuk MPASI pertama, mulailah dengan bubur saring dari satu jenis bahan seperti pisang atau alpukat.',
            'Setiap anak memiliki perkembangan yang berbeda. Namun jika khawatir, sebaiknya konsultasi ke dokter.',
            'Untuk pengganti telur, bisa menggunakan tahu, tempe, atau ikan sebagai sumber protein.',
            'Untuk meningkatkan nafsu makan, pastikan jadwal makan teratur dan hindari snack berlebihan.',
        ];

        $kaders = [$users['kader1'], $users['kader2']];
        $consultationIndex = 0;

        // Create consultations for various parents
        foreach ($users['parents'] as $parentIndex => $parent) {
            // Each parent gets 1-3 consultations
            $numConsultations = rand(1, 3);
            
            for ($i = 0; $i < $numConsultations; $i++) {
                $kader = $kaders[$parentIndex < 10 ? 0 : 1];
                $childrenOfParent = array_filter($children, fn($c) => $c->parent_id === $parent->id);
                
                if (empty($childrenOfParent)) continue;
                
                $child = $childrenOfParent[array_rand($childrenOfParent)];
                $topicIndex = $consultationIndex % count($consultationTopics);
                
                // Vary status: 60% open, 40% closed
                $status = rand(1, 10) <= 6 ? 'open' : 'closed';
                
                $consultation = Consultation::create([
                    'parent_id' => $parent->id,
                    'kader_id' => $kader->id,
                    'child_id' => $child->id,
                    'title' => $consultationTopics[$topicIndex],
                    'status' => $status,
                    'created_at' => Carbon::now()->subDays(rand(1, 30)),
                ]);

                // Create messages
                $numMessages = rand(2, 8);
                for ($j = 0; $j < $numMessages; $j++) {
                    $isParent = $j % 2 === 0;
                    $messageIndex = $topicIndex % count($parentMessages);
                    
                    ConsultationMessage::create([
                        'consultation_id' => $consultation->id,
                        'sender_id' => $isParent ? $parent->id : $kader->id,
                        'message' => $isParent ? $parentMessages[$messageIndex] : $kaderResponses[$messageIndex],
                        'created_at' => $consultation->created_at->addMinutes($j * rand(5, 60)),
                    ]);
                }

                $consultationIndex++;
            }
        }
    }

    private function createArticles(array $users): void
    {
        $articles = [
            [
                'title' => 'Tips Memberikan MPASI Pertama untuk Bayi',
                'content' => 'MPASI (Makanan Pendamping ASI) mulai diberikan saat bayi berusia 6 bulan. Mulailah dengan tekstur halus seperti bubur saring. Perkenalkan satu jenis makanan baru setiap 3-5 hari untuk mendeteksi alergi. Pastikan makanan kaya zat besi seperti daging, hati, atau sayuran hijau. Berikan MPASI secara bertahap, mulai dari 1-2 sendok makan dan tingkatkan sesuai kemampuan bayi.',
                'category' => 'tips',
            ],
            [
                'title' => 'Pentingnya Imunisasi Lengkap untuk Anak',
                'content' => 'Imunisasi adalah cara efektif melindungi anak dari penyakit berbahaya. Pastikan anak mendapat imunisasi dasar lengkap: BCG, Polio, DPT-HB-Hib, Campak, dan MR. Kunjungi Posyandu terdekat untuk jadwal imunisasi. Imunisasi tidak hanya melindungi anak Anda, tetapi juga membantu menciptakan kekebalan kelompok di masyarakat.',
                'category' => 'article',
            ],
            [
                'title' => 'Jadwal Posyandu Bulan Ini',
                'content' => 'Posyandu akan mengadakan kegiatan rutin pada tanggal 15 setiap bulannya. Kegiatan meliputi: penimbangan, pengukuran tinggi badan, pemberian vitamin A, dan konsultasi gizi. Harap membawa buku KIA dan datang tepat waktu.',
                'category' => 'announcement',
            ],
            [
                'title' => 'Mengenal Stunting dan Cara Pencegahannya',
                'content' => 'Stunting adalah kondisi gagal tumbuh pada anak akibat kekurangan gizi kronis. Pencegahan stunting dimulai dari 1000 hari pertama kehidupan. Pastikan ibu hamil mendapat nutrisi cukup, berikan ASI eksklusif 6 bulan, dan MPASI bergizi setelahnya. Pantau pertumbuhan anak secara rutin di Posyandu.',
                'category' => 'article',
            ],
            [
                'title' => 'Resep MPASI Sehat: Bubur Ayam Sayur',
                'content' => 'Bahan: 2 sdm beras, 30g daging ayam cincang, 1 buah wortel parut, 1 lembar daun bayam. Cara membuat: Masak beras dengan air hingga menjadi bubur. Tumis ayam hingga matang, tambahkan wortel dan bayam. Campurkan dengan bubur, haluskan sesuai usia bayi. Sajikan hangat.',
                'category' => 'tips',
            ],
            [
                'title' => 'Pengumuman: Program Pemberian Makanan Tambahan (PMT)',
                'content' => 'Program PMT akan dilaksanakan mulai bulan ini. Anak-anak dengan kepatuhan konsumsi PMT ≥80% akan mendapat prioritas dalam program bantuan. Pastikan anak Anda mengonsumsi PMT setiap hari dan catat di aplikasi NutriLogic.',
                'category' => 'announcement',
            ],
            [
                'title' => 'Tanda-tanda Anak Kurang Gizi',
                'content' => 'Kenali tanda-tanda anak kurang gizi: berat badan tidak naik atau turun, mudah sakit, lesu dan tidak aktif, rambut kusam dan mudah rontok, kulit kering. Jika menemukan tanda-tanda ini, segera konsultasikan ke kader atau tenaga kesehatan.',
                'category' => 'article',
            ],
            [
                'title' => 'Tips Mengatasi Anak Susah Makan',
                'content' => 'Anak susah makan adalah masalah umum. Tips mengatasinya: buat suasana makan menyenangkan, sajikan makanan dengan tampilan menarik, libatkan anak dalam menyiapkan makanan, hindari memaksa anak makan, berikan porsi kecil tapi sering, dan jadilah contoh dengan makan makanan sehat.',
                'category' => 'tips',
            ],
        ];

        foreach ($articles as $index => $article) {
            Article::create([
                'title' => $article['title'],
                'content' => $article['content'],
                'category' => $article['category'],
                'is_published' => true,
                'author_id' => $index % 2 === 0 ? $users['admin']->id : $users['kader1']->id,
                'created_at' => Carbon::now()->subDays(rand(1, 60)),
            ]);
        }
    }


    private function createUserBadges(array $users): void
    {
        $badgeCodes = [
            'first_login',
            'points_1000',
            'points_5000',
            'meal_logger_10',
            'meal_logger_50',
            'meal_logger_100',
            'daily_login_7',
            'daily_login_30',
            'early_bird',
            'night_owl',
            'weighing_logger_10',
            'weighing_logger_50',
            'consultation_active',
            'consultation_active_50',
            'weekend_warrior',
            'lunch_time',
        ];

        // Give badges based on points and activity
        foreach ($users['parents'] as $index => $parent) {
            // Everyone gets first_login
            UserBadge::create([
                'user_id' => $parent->id,
                'badge_code' => 'first_login',
                'earned_at' => Carbon::now()->subDays(rand(30, 90)),
            ]);

            // Points-based badges
            if ($parent->points >= 1000) {
                UserBadge::create([
                    'user_id' => $parent->id,
                    'badge_code' => 'points_1000',
                    'earned_at' => Carbon::now()->subDays(rand(10, 30)),
                ]);
            }
            if ($parent->points >= 5000) {
                UserBadge::create([
                    'user_id' => $parent->id,
                    'badge_code' => 'points_5000',
                    'earned_at' => Carbon::now()->subDays(rand(1, 10)),
                ]);
            }

            // Activity badges - distribute randomly
            $numExtraBadges = rand(2, 6);
            $availableBadges = array_diff($badgeCodes, ['first_login', 'points_1000', 'points_5000']);
            $selectedBadges = array_rand(array_flip($availableBadges), min($numExtraBadges, count($availableBadges)));
            
            if (!is_array($selectedBadges)) $selectedBadges = [$selectedBadges];
            
            foreach ($selectedBadges as $badge) {
                UserBadge::create([
                    'user_id' => $parent->id,
                    'badge_code' => $badge,
                    'earned_at' => Carbon::now()->subDays(rand(1, 60)),
                ]);
            }
        }

        // Kaders get some badges too
        foreach ([$users['kader1'], $users['kader2']] as $kader) {
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
        }
    }

    private function createNotifications(array $users): void
    {
        $notificationTemplates = [
            ['type' => 'schedule', 'title' => 'Jadwal Posyandu', 'message' => 'Jangan lupa jadwal posyandu besok pukul 08:00'],
            ['type' => 'reminder', 'title' => 'Pengingat Penimbangan', 'message' => 'Sudah waktunya menimbang anak Anda bulan ini'],
            ['type' => 'pmt', 'title' => 'PMT Hari Ini', 'message' => 'Jangan lupa catat konsumsi PMT anak hari ini'],
            ['type' => 'badge', 'title' => 'Badge Baru!', 'message' => 'Selamat! Anda mendapatkan badge baru'],
            ['type' => 'consultation', 'title' => 'Pesan Baru', 'message' => 'Anda memiliki pesan baru dari kader'],
            ['type' => 'article', 'title' => 'Artikel Baru', 'message' => 'Ada artikel baru tentang nutrisi anak'],
            ['type' => 'system', 'title' => 'Pembaruan Sistem', 'message' => 'Aplikasi telah diperbarui dengan fitur baru'],
            ['type' => 'vitamin', 'title' => 'Jadwal Vitamin A', 'message' => 'Waktunya pemberian vitamin A untuk anak Anda'],
        ];

        // Create notifications for all parents
        foreach ($users['parents'] as $parent) {
            $numNotifications = rand(5, 15);
            
            for ($i = 0; $i < $numNotifications; $i++) {
                $template = $notificationTemplates[array_rand($notificationTemplates)];
                $isRead = rand(0, 1);
                $createdAt = Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23));
                
                Notification::create([
                    'user_id' => $parent->id,
                    'type' => $template['type'],
                    'title' => $template['title'],
                    'message' => $template['message'],
                    'link' => null,
                    'is_read' => $isRead,
                    'read_at' => $isRead ? $createdAt->addHours(rand(1, 12)) : null,
                    'metadata' => null,
                    'created_at' => $createdAt,
                ]);
            }
        }

        // Notifications for kaders
        foreach ([$users['kader1'], $users['kader2']] as $kader) {
            for ($i = 0; $i < rand(8, 12); $i++) {
                $template = $notificationTemplates[array_rand($notificationTemplates)];
                $isRead = rand(0, 1);
                $createdAt = Carbon::now()->subDays(rand(0, 14));
                
                Notification::create([
                    'user_id' => $kader->id,
                    'type' => $template['type'],
                    'title' => $template['title'],
                    'message' => $template['message'],
                    'is_read' => $isRead,
                    'read_at' => $isRead ? $createdAt->addHours(rand(1, 6)) : null,
                    'created_at' => $createdAt,
                ]);
            }
        }
    }

    private function createActivityLogs(array $users): void
    {
        $actions = [
            ['action' => 'login', 'model' => 'User', 'description' => 'User logged in'],
            ['action' => 'create', 'model' => 'MealLog', 'description' => 'Created meal log'],
            ['action' => 'create', 'model' => 'WeighingLog', 'description' => 'Created weighing log'],
            ['action' => 'update', 'model' => 'Child', 'description' => 'Updated child data'],
            ['action' => 'create', 'model' => 'Consultation', 'description' => 'Started new consultation'],
            ['action' => 'create', 'model' => 'PmtLog', 'description' => 'Recorded PMT consumption'],
            ['action' => 'view', 'model' => 'Article', 'description' => 'Viewed article'],
            ['action' => 'update', 'model' => 'User', 'description' => 'Updated profile'],
        ];

        $allUsers = array_merge(
            [$users['admin'], $users['kader1'], $users['kader2']],
            $users['parents']
        );

        // Create 200+ activity logs for comprehensive testing
        for ($i = 0; $i < 250; $i++) {
            $user = $allUsers[array_rand($allUsers)];
            $action = $actions[array_rand($actions)];
            
            ActivityLog::create([
                'user_id' => $user->id,
                'action' => $action['action'],
                'model' => $action['model'],
                'model_id' => rand(1, 100),
                'description' => $action['description'],
                'ip_address' => '192.168.1.' . rand(1, 255),
                'metadata' => json_encode(['browser' => 'Chrome', 'platform' => 'Windows']),
                'created_at' => Carbon::now()->subDays(rand(0, 60))->subHours(rand(0, 23)),
            ]);
        }
    }

    private function createBroadcastLogs(array $users, array $posyandus): void
    {
        // Valid types: 'jadwal_posyandu', 'info_gizi', 'pengumuman_umum', 'lainnya'
        $broadcastMessages = [
            ['message' => 'Pengingat: Jadwal posyandu besok pukul 08:00. Harap membawa buku KIA.', 'type' => 'jadwal_posyandu'],
            ['message' => 'Info: Pemberian vitamin A akan dilaksanakan minggu depan.', 'type' => 'info_gizi'],
            ['message' => 'Penting: Pastikan anak Anda mengonsumsi PMT setiap hari.', 'type' => 'info_gizi'],
            ['message' => 'Pengumuman: Ada penyuluhan gizi di balai desa hari Sabtu.', 'type' => 'pengumuman_umum'],
            ['message' => 'Reminder: Jangan lupa catat makanan anak di aplikasi NutriLogic.', 'type' => 'lainnya'],
            ['message' => 'Info kesehatan: Tips menjaga kesehatan anak di musim hujan.', 'type' => 'info_gizi'],
        ];

        // Broadcasts from Kader 1
        foreach ($broadcastMessages as $index => $data) {
            if ($index < 4) {
                BroadcastLog::create([
                    'posyandu_id' => $posyandus['posyandu1']->id,
                    'sender_id' => $users['kader1']->id,
                    'message' => $data['message'],
                    'type' => $data['type'],
                    'created_at' => Carbon::now()->subDays(rand(1, 30)),
                ]);
            }
        }

        // Broadcasts from Kader 2
        foreach ($broadcastMessages as $index => $data) {
            if ($index >= 2) {
                BroadcastLog::create([
                    'posyandu_id' => $posyandus['posyandu2']->id,
                    'sender_id' => $users['kader2']->id,
                    'message' => $data['message'],
                    'type' => $data['type'],
                    'created_at' => Carbon::now()->subDays(rand(1, 20)),
                ]);
            }
        }
    }


    private function printSummary(array $users): void
    {
        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('   COMPREHENSIVE TEST DATA COMPLETED!   ');
        $this->command->info('========================================');
        $this->command->info('');
        $this->command->info('LOGIN CREDENTIALS:');
        $this->command->info('------------------');
        $this->command->info('');
        $this->command->info('ADMIN:');
        $this->command->info('  Phone: 081234567890');
        $this->command->info('  Email: admin@nutrilogic.com');
        $this->command->info('  Password: Admin123');
        $this->command->info('');
        $this->command->info('KADER 1 (Posyandu Mawar):');
        $this->command->info('  Phone: 081234567891');
        $this->command->info('  Email: kader@nutrilogic.com');
        $this->command->info('  Password: Kader123');
        $this->command->info('');
        $this->command->info('KADER 2 (Posyandu Melati):');
        $this->command->info('  Phone: 081234567894');
        $this->command->info('  Email: kader2@nutrilogic.com');
        $this->command->info('  Password: Kader123');
        $this->command->info('');
        $this->command->info('SAMPLE PARENTS (all password: Parent123):');
        $this->command->info('  - Ratna Dewi (081234567892) - 1500 points, 3 children');
        $this->command->info('  - Wulan Sari (081234567893) - 5200 points, 3 children');
        $this->command->info('  - Maya Anggraini (081234567907) - 4200 points');
        $this->command->info('  - Fitri Handayani (081234567900) - 3500 points');
        $this->command->info('  ... and 11 more parents');
        $this->command->info('');
        $this->command->info('DATA SUMMARY:');
        $this->command->info('------------------');
        $this->command->info('  - 2 Posyandus');
        $this->command->info('  - 18 Users (1 Admin, 2 Kaders, 15 Parents)');
        $this->command->info('  - 28 Children with various ages (5-48 months)');
        $this->command->info('  - ~168 Weighing Logs (6 per child)');
        $this->command->info('  - ~2000+ Meal Logs (50-100 per child)');
        $this->command->info('  - ~800+ PMT Logs (full month data)');
        $this->command->info('  - 16 Posyandu Schedules');
        $this->command->info('  - 100+ Vitamin Distributions');
        $this->command->info('  - 200+ Immunization Records');
        $this->command->info('  - 30+ Consultations with messages');
        $this->command->info('  - 8 Articles');
        $this->command->info('  - 100+ User Badges');
        $this->command->info('  - 150+ Notifications');
        $this->command->info('  - 250+ Activity Logs');
        $this->command->info('  - 10+ Broadcast Logs');
        $this->command->info('');
        $this->command->info('PMT ELIGIBILITY (>=80% compliance):');
        $this->command->info('  - full (100%): ~10 children - ELIGIBLE');
        $this->command->info('  - high (85-95%): ~8 children - ELIGIBLE');
        $this->command->info('  - medium (70-79%): ~4 children - NOT ELIGIBLE');
        $this->command->info('  - low (50-69%): ~4 children - NOT ELIGIBLE');
        $this->command->info('  - very_low (30-49%): ~2 children - NOT ELIGIBLE');
        $this->command->info('');
        $this->command->info('FEATURES COVERED:');
        $this->command->info('  ✓ Pagination (15 parents, 28 children)');
        $this->command->info('  ✓ PMT Tracking & Eligibility');
        $this->command->info('  ✓ PMT Reward System (>=80% = eligible)');
        $this->command->info('  ✓ Points & Badges System');
        $this->command->info('  ✓ Nutritional Status Tracking');
        $this->command->info('  ✓ Meal Logging (Jurnal Makan)');
        $this->command->info('  ✓ Weighing Logs with Z-scores');
        $this->command->info('  ✓ Consultations (open/closed)');
        $this->command->info('  ✓ Notifications System');
        $this->command->info('  ✓ Activity Logging');
        $this->command->info('  ✓ Broadcast Messages');
        $this->command->info('  ✓ Vitamin Distribution');
        $this->command->info('  ✓ Immunization Records');
        $this->command->info('  ✓ Multiple Posyandus');
        $this->command->info('  ✓ Online Status (last_seen_at)');
        $this->command->info('========================================');
    }
}
