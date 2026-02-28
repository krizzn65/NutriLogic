<?php

namespace Database\Seeders;

use App\Models\Child;
use App\Models\WeighingLog;
use App\Models\VitaminDistribution;
use App\Models\ImmunizationRecord;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class HealthSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates WeighingLogs, VitaminDistributions, and ImmunizationRecords.
     */
    public function run(): void
    {
        $children = Child::all();

        $this->createWeighingLogs($children);
        $this->createVitaminDistributions($children);
        $this->createImmunizationRecords($children);
    }

    private function createWeighingLogs($children): void
    {
        $this->command->info('Creating Weighing Logs...');

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

        $this->command->info('✓ Created ~168 Weighing Logs (6 per child)');
    }

    private function createVitaminDistributions($children): void
    {
        $this->command->info('Creating Vitamin Distributions...');

        $count = 0;
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
                    $count++;
                }
            }
        }

        $this->command->info("✓ Created {$count} Vitamin Distributions");
    }

    private function createImmunizationRecords($children): void
    {
        $this->command->info('Creating Immunization Records...');

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

        $count = 0;
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
                    $count++;
                }
            }
        }

        $this->command->info("✓ Created {$count} Immunization Records");
    }
}
