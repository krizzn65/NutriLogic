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

        $samples = [
            [
                'time_of_day' => 'pagi',
                'description' => 'Bubur nasi dengan telur dan sayur wortel',
                'ingredients' => 'nasi, telur, wortel',
            ],
            [
                'time_of_day' => 'siang',
                'description' => 'Nasi, ayam rebus, sayur bayam',
                'ingredients' => 'nasi, ayam, bayam',
            ],
            [
                'time_of_day' => 'malam',
                'description' => 'Bubur kacang hijau dan susu',
                'ingredients' => 'kacang hijau, susu',
            ],
            [
                'time_of_day' => 'snack',
                'description' => 'Pisang kukus dan biskuit bayi',
                'ingredients' => 'pisang, biskuit',
            ],
        ];

        foreach ($children as $child) {
            // Misal buat log untuk 2 hari terakhir
            for ($day = 2; $day >= 1; $day--) {
                $date = Carbon::now()->subDays($day)->toDateString();

                foreach ($samples as $sample) {
                    MealLog::create([
                        'child_id'    => $child->id,
                        'eaten_at'    => $date,
                        'time_of_day' => $sample['time_of_day'],
                        'description' => $sample['description'],
                        'ingredients' => $sample['ingredients'],
                        'source'      => 'ortu',
                    ]);
                }
            }
        }
    }
}
