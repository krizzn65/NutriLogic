<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Child;
use App\Models\MealLog;
use Illuminate\Support\Carbon;

class MealLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $children = Child::all();

        if ($children->isEmpty()) {
            return;
        }

        $meals = [
            // Sarapan
            [
                'time_of_day' => 'pagi',
                'description' => 'Bubur nasi dengan telur dan sayur wortel',
                'ingredients' => 'nasi, telur, wortel',
            ],
            [
                'time_of_day' => 'pagi',
                'description' => 'Nasi tim ikan dengan brokoli',
                'ingredients' => 'nasi, ikan, brokoli',
            ],
            [
                'time_of_day' => 'pagi',
                'description' => 'Bubur ayam dengan bayam dan tahu',
                'ingredients' => 'ayam, bayam, tahu',
            ],
            // Makan siang
            [
                'time_of_day' => 'siang',
                'description' => 'Nasi, ayam rebus, sayur bayam',
                'ingredients' => 'nasi, ayam, bayam',
            ],
            [
                'time_of_day' => 'siang',
                'description' => 'Nasi dengan tempe goreng dan sup wortel',
                'ingredients' => 'nasi, tempe, wortel',
            ],
            [
                'time_of_day' => 'siang',
                'description' => 'Bubur kacang merah dengan ubi',
                'ingredients' => 'kacang merah, ubi',
            ],
            // Makan malam
            [
                'time_of_day' => 'malam',
                'description' => 'Bubur kacang hijau dan susu',
                'ingredients' => 'kacang hijau, susu',
            ],
            [
                'time_of_day' => 'malam',
                'description' => 'Nasi tim hati ayam dengan labu',
                'ingredients' => 'hati ayam, labu, nasi',
            ],
            [
                'time_of_day' => 'malam',
                'description' => 'Pure kentang dengan keju dan telur',
                'ingredients' => 'kentang, keju, telur',
            ],
            // Snack
            [
                'time_of_day' => 'snack',
                'description' => 'Pisang kukus dan biskuit bayi',
                'ingredients' => 'pisang, biskuit',
            ],
            [
                'time_of_day' => 'snack',
                'description' => 'Puding buah dan yogurt',
                'ingredients' => 'buah, yogurt',
            ],
            [
                'time_of_day' => 'snack',
                'description' => 'Alpukat dengan susu',
                'ingredients' => 'alpukat, susu',
            ],
        ];

        foreach ($children as $child) {
            // Buat log makanan untuk 7 hari terakhir
            $daysToSeed = rand(5, 7);

            for ($day = $daysToSeed; $day >= 1; $day--) {
                $date = Carbon::now()->subDays($day)->toDateString();

                // Random 2-4 kali makan per hari
                $mealsPerDay = rand(2, 4);
                $selectedMeals = [];

                for ($i = 0; $i < $mealsPerDay; $i++) {
                    $meal = $meals[array_rand($meals)];

                    // Hindari duplikasi waktu makan di hari yang sama
                    if (!in_array($meal['time_of_day'], array_column($selectedMeals, 'time_of_day'))) {
                        $selectedMeals[] = $meal;

                        MealLog::create([
                            'child_id'    => $child->id,
                            'eaten_at'    => $date,
                            'time_of_day' => $meal['time_of_day'],
                            'description' => $meal['description'],
                            'ingredients' => $meal['ingredients'],
                            'source'      => rand(0, 1) ? 'ortu' : 'kader',
                        ]);
                    }
                }
            }
        }
    }
}
