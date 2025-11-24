<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Child;
use App\Models\WeighingLog;
use Illuminate\Support\Carbon;

class WeighingLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Kalau mau bersih tiap seed:
        $children = Child::all();

        if ($children->isEmpty()) {
            return;
        }

        foreach ($children as $child) {
            // Misal buat 3 log penimbangan mundur 3 bulan
            for ($i = 3; $i >= 1; $i--) {
                $date = Carbon::now()->subMonths($i);

                // Biar beratnya agak naik tiap bulan (dummy sederhana)
                $baseWeight = 10; // kg, terserah kamu mau setting berapa
                $weight = $baseWeight + ($child->id % 3) + ($i * 0.3);

                WeighingLog::create([
                    'child_id'           => $child->id,
                    'measured_at'        => $date->toDateString(),
                    'weight_kg'          => round($weight, 1),
                    'height_cm'          => 75 + ($child->id % 5) + ($i * 0.5),
                    'muac_cm'            => 13.5 + ($child->id % 2),
                    'zscore_wfa'         => null, // bisa kamu hitung nanti
                    'zscore_hfa'         => null,
                    'zscore_wfh'         => null,
                    'nutritional_status' => 'normal', // awalnya normal dulu
                    'is_posyandu_day'    => 1,
                    'notes'              => 'Penimbangan rutin bulan ' . $date->format('F Y'),
                ]);
            }
        }
    }
}
