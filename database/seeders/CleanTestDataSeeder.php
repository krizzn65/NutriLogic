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
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CleanTestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Creates clean test data for:
     * - 1 Admin
     * - 1 Kader
     * - 2 Parents (each with 3 children)
     * - Complete data for all related tables
     */
    public function run(): void
    {
        // Clear existing data (in correct order to avoid FK constraints)
        $this->command->info('Clearing existing data...');

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        ConsultationMessage::truncate();
        Consultation::truncate();
        UserBadge::truncate();
        PmtLog::truncate();
        MealLog::truncate();
        ImmunizationSchedule::truncate();
        WeighingLog::truncate();
        Child::truncate();
        Article::truncate();
        User::truncate();
        Posyandu::truncate();

        // Clear activity logs and settings if exists
        DB::table('activity_logs')->truncate();
        DB::table('personal_access_tokens')->truncate();

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command->info('Creating Posyandu...');

        // ========================
        // 1. CREATE POSYANDU
        // ========================
        $posyandu = Posyandu::create([
            'name' => 'Posyandu Mawar Sehat',
            'village' => 'Desa Sukamaju',
            'address' => 'Jl. Kesehatan No. 123, RT 01/RW 02',
            'rt_rw' => '01/02',
            'city' => 'Jember',
            'latitude' => -8.1656,
            'longitude' => 113.7028,
            'is_active' => true,
        ]);

        $this->command->info('Creating Users...');

        // ========================
        // 2. CREATE USERS
        // ========================

        // Admin
        $admin = User::create([
            'name' => 'Admin NutriLogic',
            'email' => 'admin@nutrilogic.com',
            'phone' => '081234567890',
            'password' => 'Admin123',  // Will be hashed by model cast
            'role' => 'admin',
            'posyandu_id' => null,
            'is_active' => true,
            'points' => 0,
        ]);

        // Kader
        $kader = User::create([
            'name' => 'Siti Kader',
            'email' => 'kader@nutrilogic.com',
            'phone' => '081234567891',
            'password' => 'Kader123',
            'role' => 'kader',
            'posyandu_id' => $posyandu->id,
            'is_active' => true,
            'points' => 0,
            'address' => 'Jl. Posyandu No. 1',
            'rt' => '01',
            'rw' => '02',
        ]);

        // Parent 1 - Ibu Ratna
        $parent1 = User::create([
            'name' => 'Ratna Dewi',
            'email' => 'ratna@gmail.com',
            'phone' => '081234567892',
            'password' => 'Parent123',
            'role' => 'ibu',
            'posyandu_id' => $posyandu->id,
            'is_active' => true,
            'points' => 150,
            'address' => 'Jl. Melati No. 10',
            'rt' => '03',
            'rw' => '02',
        ]);

        // Parent 2 - Ibu Wulan
        $parent2 = User::create([
            'name' => 'Wulan Sari',
            'email' => 'wulan@gmail.com',
            'phone' => '081234567893',
            'password' => 'Parent123',
            'role' => 'ibu',
            'posyandu_id' => $posyandu->id,
            'is_active' => true,
            'points' => 200,
            'address' => 'Jl. Anggrek No. 15',
            'rt' => '04',
            'rw' => '02',
        ]);

        $this->command->info('Creating Children...');

        // ========================
        // 3. CREATE CHILDREN
        // ========================

        // Children for Parent 1 (Ratna)
        $child1 = Child::create([
            'parent_id' => $parent1->id,
            'posyandu_id' => $posyandu->id,
            'full_name' => 'Ahmad Rizki',
            'nik' => '3509010101200001',
            'birth_date' => Carbon::now()->subMonths(24),  // 2 tahun
            'gender' => 'L',
            'birth_weight_kg' => 3.2,
            'birth_height_cm' => 50.0,
            'notes' => 'Anak pertama, lahir normal',
            'is_active' => true,
        ]);

        $child2 = Child::create([
            'parent_id' => $parent1->id,
            'posyandu_id' => $posyandu->id,
            'full_name' => 'Siti Aisyah',
            'nik' => '3509010101200002',
            'birth_date' => Carbon::now()->subMonths(12),  // 1 tahun
            'gender' => 'P',
            'birth_weight_kg' => 3.0,
            'birth_height_cm' => 48.5,
            'notes' => 'Anak kedua',
            'is_active' => true,
        ]);

        $child3 = Child::create([
            'parent_id' => $parent1->id,
            'posyandu_id' => $posyandu->id,
            'full_name' => 'Muhammad Fauzan',
            'nik' => '3509010101200003',
            'birth_date' => Carbon::now()->subMonths(6),  // 6 bulan
            'gender' => 'L',
            'birth_weight_kg' => 3.5,
            'birth_height_cm' => 51.0,
            'notes' => 'Anak ketiga, masih ASI eksklusif',
            'is_active' => true,
        ]);

        // Children for Parent 2 (Wulan)
        $child4 = Child::create([
            'parent_id' => $parent2->id,
            'posyandu_id' => $posyandu->id,
            'full_name' => 'Putri Amelia',
            'nik' => '3509010101200004',
            'birth_date' => Carbon::now()->subMonths(36),  // 3 tahun
            'gender' => 'P',
            'birth_weight_kg' => 3.1,
            'birth_height_cm' => 49.0,
            'notes' => 'Sudah bisa bicara lancar',
            'is_active' => true,
        ]);

        $child5 = Child::create([
            'parent_id' => $parent2->id,
            'posyandu_id' => $posyandu->id,
            'full_name' => 'Budi Santoso',
            'nik' => '3509010101200005',
            'birth_date' => Carbon::now()->subMonths(18),  // 1.5 tahun
            'gender' => 'L',
            'birth_weight_kg' => 3.3,
            'birth_height_cm' => 50.5,
            'notes' => 'Aktif bermain',
            'is_active' => true,
        ]);

        $child6 = Child::create([
            'parent_id' => $parent2->id,
            'posyandu_id' => $posyandu->id,
            'full_name' => 'Citra Lestari',
            'nik' => '3509010101200006',
            'birth_date' => Carbon::now()->subMonths(8),  // 8 bulan
            'gender' => 'P',
            'birth_weight_kg' => 2.9,
            'birth_height_cm' => 47.5,
            'notes' => 'BBLR, perlu pantauan khusus',
            'is_active' => true,
        ]);

        $allChildren = [$child1, $child2, $child3, $child4, $child5, $child6];

        $this->command->info('Creating Weighing Logs...');

        // ========================
        // 4. CREATE WEIGHING LOGS
        // ========================
        foreach ($allChildren as $child) {
            $ageMonths = Carbon::parse($child->birth_date)->diffInMonths(Carbon::now());
            $baseWeight = $child->birth_weight_kg;
            $baseHeight = $child->birth_height_cm;

            // Create 3 weighing logs per child (monthly)
            for ($i = 2; $i >= 0; $i--) {
                $monthsAgo = $i;
                $measuredAt = Carbon::now()->subMonths($monthsAgo);

                // Simulate growth
                $weight = $baseWeight + (($ageMonths - $i) * 0.3);  // ~300g per month
                $height = $baseHeight + (($ageMonths - $i) * 1.5);  // ~1.5cm per month

                WeighingLog::create([
                    'child_id' => $child->id,
                    'measured_at' => $measuredAt,
                    'weight_kg' => min($weight, 20),  // Cap at reasonable weight
                    'height_cm' => min($height, 120), // Cap at reasonable height
                    'muac_cm' => 13.5 + ($i * 0.2),
                    'head_circumference_cm' => 42 + ($ageMonths * 0.3),
                    'zscore_wfa' => rand(-10, 10) / 10,
                    'zscore_hfa' => rand(-10, 10) / 10,
                    'zscore_wfh' => rand(-10, 10) / 10,
                    'nutritional_status' => ['Gizi Baik', 'Gizi Kurang', 'Gizi Lebih'][rand(0, 2)],
                    'is_posyandu_day' => true,
                    'notes' => "Pemeriksaan rutin bulan " . $measuredAt->format('F Y'),
                ]);
            }
        }

        $this->command->info('Creating Meal Logs...');

        // ========================
        // 5. CREATE MEAL LOGS
        // ========================
        $mealDescriptions = [
            'pagi' => ['Bubur ayam dengan telur', 'Nasi tim sayur', 'Bubur kacang hijau', 'Roti dengan susu'],
            'siang' => ['Nasi, ayam goreng, sayur bayam', 'Nasi, ikan, tumis kangkung', 'Sup ayam sayuran', 'Nasi, tempe, sayur sop'],
            'malam' => ['Bubur sumsum', 'Nasi lembek dengan lauk', 'Sup makaroni', 'Nasi dengan telur dadar'],
            'snack' => ['Buah pisang', 'Biskuit bayi', 'Puding susu', 'Jus buah'],
        ];

        foreach ($allChildren as $child) {
            // Create 5-7 meal logs per child in last 7 days
            for ($i = 0; $i < rand(5, 7); $i++) {
                $timeOfDay = ['pagi', 'siang', 'malam', 'snack'][rand(0, 3)];

                MealLog::create([
                    'child_id' => $child->id,
                    'eaten_at' => Carbon::now()->subDays(rand(0, 6)),
                    'time_of_day' => $timeOfDay,
                    'description' => $mealDescriptions[$timeOfDay][rand(0, 3)],
                    'ingredients' => 'Bahan-bahan segar dan bergizi',
                    'portion' => ['habis', 'setengah', 'sedikit'][rand(0, 2)],
                    'notes' => 'Anak makan dengan lahap',
                    'source' => ['ortu', 'kader'][rand(0, 1)],
                ]);
            }
        }

        $this->command->info('Creating Posyandu Schedules...');

        // ========================
        // 6. CREATE POSYANDU SCHEDULES (General schedules for all children)
        // ========================
        $schedules = [
            [
                'title' => 'Posyandu Rutin - Penimbangan & Imunisasi',
                'scheduled_for' => Carbon::now()->addDays(7)->setTime(8, 0),
                'location' => 'Posyandu Mawar Sehat',
                'notes' => 'Harap membawa buku KIA',
            ],
            [
                'title' => 'Pemberian Vitamin A',
                'scheduled_for' => Carbon::now()->addDays(14)->setTime(9, 0),
                'location' => 'Posyandu Mawar Sehat',
                'notes' => 'Untuk anak usia 6-59 bulan',
            ],
            [
                'title' => 'Imunisasi Campak & Rubella',
                'scheduled_for' => Carbon::now()->addDays(21)->setTime(8, 30),
                'location' => 'Posyandu Mawar Sehat',
                'notes' => 'Bawa kartu imunisasi',
            ],
            [
                'title' => 'Penyuluhan Gizi Seimbang',
                'scheduled_for' => Carbon::now()->addDays(28)->setTime(10, 0),
                'location' => 'Balai Desa Sukamaju',
                'notes' => 'Untuk semua orang tua',
            ],
            [
                'title' => 'Posyandu Rutin - Pemeriksaan Kesehatan',
                'scheduled_for' => Carbon::now()->subDays(7)->setTime(8, 0),
                'location' => 'Posyandu Mawar Sehat',
                'notes' => 'Sudah dilaksanakan',
            ],
        ];

        foreach ($schedules as $index => $schedule) {
            $isCompleted = $index === 4; // Last one is completed

            ImmunizationSchedule::create([
                'child_id' => null, // General schedule for all children
                'posyandu_id' => $posyandu->id,
                'title' => $schedule['title'],
                'type' => 'posyandu',
                'scheduled_for' => $schedule['scheduled_for'],
                'location' => $schedule['location'],
                'completed_at' => $isCompleted ? $schedule['scheduled_for'] : null,
                'notes' => $schedule['notes'],
            ]);
        }

        $this->command->info('Creating PMT Logs...');

        // ========================
        // 7. CREATE PMT LOGS
        // ========================
        $this->command->info('Creating PMT Logs...');
        
        // Get PREVIOUS month (complete month) - November 2025
        $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth();
        $endOfLastMonth = Carbon::now()->subMonth()->endOfMonth();
        $daysInLastMonth = $startOfLastMonth->daysInMonth;
        
        $this->command->info("Creating PMT logs for: " . $startOfLastMonth->format('F Y'));
        $this->command->info("Total days in month: {$daysInLastMonth}");
        
        // Child 1 (Ahmad Rizki) - 100% PMT Compliance (ELIGIBLE)
        // Consumed PMT EVERY SINGLE DAY of previous month
        for ($i = 0; $i < $daysInLastMonth; $i++) {
            PmtLog::create([
                'child_id' => $child1->id,
                'date' => $startOfLastMonth->copy()->addDays($i)->format('Y-m-d'),
                'status' => 'consumed',
                'notes' => 'Habis semua, anak suka',
            ]);
        }
        
        // Child 2 (Siti Aisyah) - ~90% PMT Compliance (ELIGIBLE)
        // Consumed 27 out of 30 days (90%)
        $missedDays = [5, 12, 20]; // Missed 3 days
        for ($i = 0; $i < $daysInLastMonth; $i++) {
            if (!in_array($i, $missedDays)) {
                PmtLog::create([
                    'child_id' => $child2->id,
                    'date' => $startOfLastMonth->copy()->addDays($i)->format('Y-m-d'),
                    'status' => 'consumed',
                    'notes' => 'Makan dengan lahap',
                ]);
            }
        }
        
        // Child 3 (Muhammad Fauzan) - ~83% PMT Compliance (ELIGIBLE)
        // Consumed 25 out of 30 days (83%)
        $missedDays = [3, 8, 15, 22, 28]; // Missed 5 days
        for ($i = 0; $i < $daysInLastMonth; $i++) {
            if (!in_array($i, $missedDays)) {
                PmtLog::create([
                    'child_id' => $child3->id,
                    'date' => $startOfLastMonth->copy()->addDays($i)->format('Y-m-d'),
                    'status' => 'consumed',
                    'notes' => 'Porsi habis',
                ]);
            }
        }
        
        // Child 4 (Putri Amelia) - ~70% PMT Compliance (NOT ELIGIBLE)
        // Consumed 21 out of 30 days, some partial/refused
        for ($i = 0; $i < $daysInLastMonth; $i++) {
            $status = 'consumed';
            $notes = 'Habis';
            
            // Pattern: consumed most days, but some refused/partial
            if (in_array($i, [2, 6, 11, 16, 21, 26])) {
                $status = 'refused';
                $notes = 'Tidak mau makan';
            } elseif (in_array($i, [4, 14, 24])) {
                $status = 'partial';
                $notes = 'Setengah porsi';
            }
            
            PmtLog::create([
                'child_id' => $child4->id,
                'date' => $startOfLastMonth->copy()->addDays($i)->format('Y-m-d'),
                'status' => $status,
                'notes' => $notes,
            ]);
        }
        
        // Child 5 (Budi Santoso) - ~50% PMT Compliance (NOT ELIGIBLE)
        // Only consumed 15 out of 30 days (every other day)
        for ($i = 0; $i < $daysInLastMonth; $i++) {
            if ($i % 2 === 0) {  // Only even days
                PmtLog::create([
                    'child_id' => $child5->id,
                    'date' => $startOfLastMonth->copy()->addDays($i)->format('Y-m-d'),
                    'status' => 'consumed',
                    'notes' => 'Makan sedikit',
                ]);
            }
        }
        
        // Child 6 (Citra Lestari) - ~60% PMT Compliance (NOT ELIGIBLE)
        // Consumed 18 out of 30 days, irregular pattern
        $consumedDays = [0, 1, 2, 5, 7, 9, 10, 13, 15, 17, 19, 21, 23, 24, 26, 27, 28, 29]; // 18 days
        for ($i = 0; $i < $daysInLastMonth; $i++) {
            PmtLog::create([
                'child_id' => $child6->id,
                'date' => $startOfLastMonth->copy()->addDays($i)->format('Y-m-d'),
                'status' => in_array($i, $consumedDays) ? 'consumed' : 'refused',
                'notes' => in_array($i, $consumedDays) ? 'Habis porsi' : 'Menangis, tidak mau',
            ]);
        }
        
        $this->command->info('PMT Logs created for PREVIOUS MONTH (' . $startOfLastMonth->format('F Y') . '):');
        $this->command->info("  - Child 1 (Ahmad): {$daysInLastMonth}/{$daysInLastMonth} days = 100% ✓ ELIGIBLE");
        $this->command->info("  - Child 2 (Siti): " . ($daysInLastMonth - 3) . "/{$daysInLastMonth} days = ~90% ✓ ELIGIBLE");
        $this->command->info("  - Child 3 (Fauzan): " . ($daysInLastMonth - 5) . "/{$daysInLastMonth} days = ~83% ✓ ELIGIBLE");
        $this->command->info("  - Child 4 (Putri): 21/{$daysInLastMonth} days = ~70% ✗ NOT ELIGIBLE");
        $this->command->info("  - Child 5 (Budi): 15/{$daysInLastMonth} days = ~50% ✗ NOT ELIGIBLE");
        $this->command->info("  - Child 6 (Citra): 18/{$daysInLastMonth} days = ~60% ✗ NOT ELIGIBLE");

        $this->command->info('Creating Consultations...');

        // ========================
        // 8. CREATE CONSULTATIONS
        // ========================
        $consultation1 = Consultation::create([
            'parent_id' => $parent1->id,
            'kader_id' => $kader->id,
            'child_id' => $child1->id,
            'title' => 'Konsultasi tentang pola makan anak',
            'status' => 'open',
        ]);

        ConsultationMessage::create([
            'consultation_id' => $consultation1->id,
            'sender_id' => $parent1->id,
            'message' => 'Selamat pagi Bu, saya ingin konsultasi tentang pola makan anak saya yang susah makan sayur.',
        ]);

        ConsultationMessage::create([
            'consultation_id' => $consultation1->id,
            'sender_id' => $kader->id,
            'message' => 'Selamat pagi Ibu Ratna. Untuk anak yang susah makan sayur, coba variasikan bentuk dan cara penyajiannya. Bisa dicampur dengan makanan yang disukai anak.',
        ]);

        $consultation2 = Consultation::create([
            'parent_id' => $parent2->id,
            'kader_id' => $kader->id,
            'child_id' => $child6->id,
            'title' => 'Pertanyaan tentang berat badan anak',
            'status' => 'closed',
        ]);

        ConsultationMessage::create([
            'consultation_id' => $consultation2->id,
            'sender_id' => $parent2->id,
            'message' => 'Bu, anak saya lahir dengan berat badan rendah. Bagaimana cara mengejar pertumbuhannya?',
        ]);

        ConsultationMessage::create([
            'consultation_id' => $consultation2->id,
            'sender_id' => $kader->id,
            'message' => 'Untuk bayi BBLR, pastikan pemberian ASI eksklusif dan rutin ke Posyandu untuk pemantauan. Jika sudah 6 bulan, berikan MPASI yang bergizi tinggi.',
        ]);

        $this->command->info('Creating Articles...');

        // ========================
        // 9. CREATE ARTICLES
        // ========================
        Article::create([
            'title' => 'Tips Memberikan MPASI Pertama untuk Bayi',
            'content' => 'MPASI (Makanan Pendamping ASI) mulai diberikan saat bayi berusia 6 bulan. Mulailah dengan tekstur halus seperti bubur saring. Perkenalkan satu jenis makanan baru setiap 3-5 hari untuk mendeteksi alergi. Pastikan makanan kaya zat besi seperti daging, hati, atau sayuran hijau.',
            'category' => 'tips',
            'is_published' => true,
            'author_id' => $admin->id,
        ]);

        Article::create([
            'title' => 'Pentingnya Imunisasi Lengkap untuk Anak',
            'content' => 'Imunisasi adalah cara efektif melindungi anak dari penyakit berbahaya. Pastikan anak mendapat imunisasi dasar lengkap: BCG, Polio, DPT-HB-Hib, Campak, dan MR. Kunjungi Posyandu terdekat untuk jadwal imunisasi.',
            'category' => 'article',
            'is_published' => true,
            'author_id' => $kader->id,
        ]);

        Article::create([
            'title' => 'Jadwal Posyandu Bulan Ini',
            'content' => 'Posyandu Mawar Sehat akan mengadakan kegiatan rutin pada tanggal 15 setiap bulannya. Kegiatan meliputi: penimbangan, pengukuran tinggi badan, pemberian vitamin A, dan konsultasi gizi. Harap membawa buku KIA.',
            'category' => 'announcement',
            'is_published' => true,
            'author_id' => $kader->id,
        ]);

        $this->command->info('Creating User Badges...');

        // ========================
        // 10. CREATE USER BADGES
        // ========================
        UserBadge::create([
            'user_id' => $parent1->id,
            'badge_code' => 'first_login',
            'earned_at' => Carbon::now()->subDays(30),
        ]);

        UserBadge::create([
            'user_id' => $parent1->id,
            'badge_code' => 'first_weighing',
            'earned_at' => Carbon::now()->subDays(25),
        ]);

        UserBadge::create([
            'user_id' => $parent2->id,
            'badge_code' => 'first_login',
            'earned_at' => Carbon::now()->subDays(20),
        ]);

        UserBadge::create([
            'user_id' => $parent2->id,
            'badge_code' => 'active_parent',
            'earned_at' => Carbon::now()->subDays(10),
        ]);

        // ========================
        // SUMMARY
        // ========================
        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('     TEST DATA SEEDING COMPLETED!       ');
        $this->command->info('========================================');
        $this->command->info('');
        $this->command->info('LOGIN CREDENTIALS:');
        $this->command->info('------------------');
        $this->command->info('ADMIN:');
        $this->command->info('  Phone/Name: 081234567890 or Admin NutriLogic');
        $this->command->info('  Password: Admin123');
        $this->command->info('');
        $this->command->info('KADER:');
        $this->command->info('  Phone/Name: 081234567891 or Siti Kader');
        $this->command->info('  Password: Kader123');
        $this->command->info('');
        $this->command->info('PARENT 1 (3 children):');
        $this->command->info('  Phone/Name: 081234567892 or Ratna Dewi');
        $this->command->info('  Password: Parent123');
        $this->command->info('');
        $this->command->info('PARENT 2 (3 children):');
        $this->command->info('  Phone/Name: 081234567893 or Wulan Sari');
        $this->command->info('  Password: Parent123');
        $this->command->info('');
        $this->command->info('DATA CREATED:');
        $this->command->info('  - 1 Posyandu');
        $this->command->info('  - 4 Users (1 Admin, 1 Kader, 2 Parents)');
        $this->command->info('  - 6 Children (3 per parent)');
        $this->command->info('  - 18 Weighing Logs (3 per child)');
        $this->command->info('  - ~36 Meal Logs (5-7 per child)');
        $this->command->info('  - 5 Posyandu Schedules (general for all children)');
        $this->command->info('  - ~36 PMT Logs (6 per child)');
        $this->command->info('  - 2 Consultations with messages');
        $this->command->info('  - 3 Articles');
        $this->command->info('  - 4 User Badges');
        $this->command->info('========================================');
    }
}
