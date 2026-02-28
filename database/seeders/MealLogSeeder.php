<?php

namespace Database\Seeders;

use App\Models\Child;
use App\Models\MealLog;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class MealLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates meal logs for children - more for active parents' children.
     */
    public function run(): void
    {
        $this->command->info('Creating Meal Logs...');

        $children = Child::with('parent')->get();

        $mealDescriptions = [
            'pagi' => [
                'Bubur ayam dengan telur rebus',
                'Nasi tim sayur wortel',
                'Oatmeal dengan pisang',
            ],
            'siang' => [
                'Nasi, ayam goreng, sayur bayam',
                'Sup ayam sayuran lengkap',
                'Nasi, tempe goreng, sayur sop',
            ],
            'malam' => [
                'Bubur sumsum hangat',
                'Nasi lembek dengan lauk ikan',
                'Bubur ayam',
            ],
            'snack' => [
                'Buah pisang ambon',
                'Biskuit bayi',
                'Yogurt dengan buah',
            ],
        ];

        $portions = ['habis', 'setengah', 'sedikit'];
        $sources = ['ortu', 'kader'];

        $totalLogs = 0;
        foreach ($children as $child) {
            // Determine number of logs based on parent activity
            $parentEmail = $child->parent->email ?? '';
            
            if (str_contains($parentEmail, 'ratna')) {
                $numLogs = rand(60, 80); // Ratna is very active
            } elseif (str_contains($parentEmail, 'wulan')) {
                $numLogs = rand(30, 50); // Wulan is medium active
            } else {
                $numLogs = rand(10, 20); // Ani is less active
            }

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
                $totalLogs++;
            }
        }

        $this->command->info("✓ Created {$totalLogs} Meal Logs");
    }
}
