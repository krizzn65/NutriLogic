<?php

namespace Database\Seeders;

use App\Models\Child;
use App\Models\User;
use App\Models\Posyandu;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ChildSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates children for 3 parents with various PMT compliance levels.
     * 
     * PMT Compliance Types:
     * - full (100%) -> ELIGIBLE for PMT rewards
     * - high (85-95%) -> ELIGIBLE for PMT rewards
     * - medium (70-79%) -> NOT eligible
     * - low (50-69%) -> NOT eligible
     * - very_low (30-49%) -> NOT eligible
     */
    public function run(): void
    {
        $this->command->info('Creating Children...');

        $posyandu1 = Posyandu::where('name', 'Posyandu Mawar Sehat')->first();
        $posyandu2 = Posyandu::where('name', 'Posyandu Melati Indah')->first();
        
        $ratna = User::where('email', 'ratna@gmail.com')->first();
        $wulan = User::where('email', 'wulan@gmail.com')->first();
        $ani = User::where('email', 'ani@gmail.com')->first();

        $childrenData = [
            // ============ RATNA's Children (2) - ALL PMT ELIGIBLE ============
            // Both children have >=80% PMT compliance -> Mom qualifies for rewards
            [
                'parent' => $ratna,
                'posyandu' => $posyandu1,
                'name' => 'Ahmad Rizki',
                'nik' => '3509010101200001',
                'months' => 24, // 2 years old - good for weighing/immunization history
                'gender' => 'L',
                'bw' => 3.2,
                'bh' => 50.0,
                'pmt_type' => 'full', // 100% compliance - ELIGIBLE
            ],
            [
                'parent' => $ratna,
                'posyandu' => $posyandu1,
                'name' => 'Siti Aisyah',
                'nik' => '3509010101200002',
                'months' => 10, // 10 months - good for MPASI
                'gender' => 'P',
                'bw' => 3.0,
                'bh' => 48.5,
                'pmt_type' => 'high', // 90% compliance - ELIGIBLE
            ],

            // ============ WULAN's Children (2) - MIXED COMPLIANCE ============
            // One eligible, one not - shows mixed scenario
            [
                'parent' => $wulan,
                'posyandu' => $posyandu1,
                'name' => 'Budi Santoso',
                'nik' => '3509010101200003',
                'months' => 18, // 1.5 years
                'gender' => 'L',
                'bw' => 3.3,
                'bh' => 50.5,
                'pmt_type' => 'high', // 85% compliance - ELIGIBLE
            ],
            [
                'parent' => $wulan,
                'posyandu' => $posyandu1,
                'name' => 'Citra Ayu',
                'nik' => '3509010101200004',
                'months' => 8, // 8 months
                'gender' => 'P',
                'bw' => 2.9,
                'bh' => 47.5,
                'pmt_type' => 'low', // 60% compliance - NOT ELIGIBLE
            ],

            // ============ ANI's Children (2) - NOT ELIGIBLE ============
            // Both children have <80% PMT compliance
            [
                'parent' => $ani,
                'posyandu' => $posyandu2,
                'name' => 'Dimas Pratama',
                'nik' => '3509010101200005',
                'months' => 30, // 2.5 years
                'gender' => 'L',
                'bw' => 3.4,
                'bh' => 51.5,
                'pmt_type' => 'medium', // 75% compliance - NOT ELIGIBLE
            ],
            [
                'parent' => $ani,
                'posyandu' => $posyandu2,
                'name' => 'Eka Safitri',
                'nik' => '3509010101200006',
                'months' => 5, // 5 months - too young for MPASI
                'gender' => 'P',
                'bw' => 3.0,
                'bh' => 49.0,
                'pmt_type' => 'very_low', // 40% compliance - NOT ELIGIBLE
            ],
        ];

        foreach ($childrenData as $data) {
            Child::create([
                'parent_id' => $data['parent']->id,
                'posyandu_id' => $data['posyandu']->id,
                'full_name' => $data['name'],
                'nik' => $data['nik'],
                'birth_date' => Carbon::now()->subMonths($data['months']),
                'gender' => $data['gender'],
                'birth_weight_kg' => $data['bw'],
                'birth_height_cm' => $data['bh'],
                'notes' => 'PMT type: ' . $data['pmt_type'],
                'is_active' => true,
            ]);
        }

        $this->command->info('✓ Created 6 Children (2 per parent)');
        $this->command->info('  - Ratna: 2 children (ALL PMT eligible)');
        $this->command->info('  - Wulan: 2 children (1 eligible, 1 not)');
        $this->command->info('  - Ani: 2 children (NONE PMT eligible)');
    }
}
