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
        $children = Child::all();

        if ($children->isEmpty()) {
            return;
        }

        $statuses = ['normal', 'normal', 'normal', 'pendek', 'sangat_pendek', 'kurang', 'kurus'];

        foreach ($children as $child) {
            // Buat 3-6 log penimbangan untuk setiap anak
            $logCount = rand(3, 6);

            for ($i = $logCount; $i >= 1; $i--) {
                $date = Carbon::now()->subMonths($i);

                // Hitung umur anak saat penimbangan (dalam bulan)
                $ageInMonths = Carbon::parse($child->birth_date)->diffInMonths($date);

                // Estimasi berat dan tinggi berdasarkan umur
                // Rumus kasar: berat lahir + (umur_bulan * 0.5kg), tinggi lahir + (umur_bulan * 2cm)
                $weight = $child->birth_weight_kg + ($ageInMonths * 0.5) + (rand(-10, 10) / 10);
                $height = $child->birth_height_cm + ($ageInMonths * 2) + rand(-2, 2);

                // MUAC (lingkar lengan atas) antara 11-15 cm
                $muac = rand(110, 150) / 10;

                // Status gizi random tapi mayoritas normal
                $status = $statuses[array_rand($statuses)];

                WeighingLog::create([
                    'child_id'           => $child->id,
                    'measured_at'        => $date->toDateString(),
                    'weight_kg'          => round($weight, 1),
                    'height_cm'          => round($height, 1),
                    'muac_cm'            => round($muac, 1),
                    'zscore_wfa'         => rand(-30, 30) / 10, // -3.0 to 3.0
                    'zscore_hfa'         => rand(-30, 30) / 10,
                    'zscore_wfh'         => rand(-30, 30) / 10,
                    'nutritional_status' => $status,
                    'is_posyandu_day'    => rand(0, 1),
                    'notes'              => $this->generateNotes($status, $date),
                ]);
            }
        }
    }

    private function generateNotes($status, $date): string
    {
        $notes = [
            'normal' => [
                'Pertumbuhan baik, lanjutkan pola makan sehat',
                'Kondisi anak sehat dan aktif',
                'Perkembangan sesuai usia',
                'Tetap jaga asupan gizi seimbang',
            ],
            'pendek' => [
                'Perlu perhatian khusus pada asupan protein',
                'Konsultasi gizi direkomendasikan',
                'Tingkatkan konsumsi susu dan telur',
            ],
            'sangat_pendek' => [
                'Perlu intervensi gizi segera',
                'Rujuk ke puskesmas untuk pemeriksaan lebih lanjut',
                'Ikuti program PMT',
            ],
            'kurang' => [
                'Tingkatkan frekuensi makan',
                'Berikan makanan bergizi tinggi kalori',
                'Pantau perkembangan setiap bulan',
            ],
            'kurus' => [
                'Perlu peningkatan asupan kalori',
                'Konsultasi ahli gizi disarankan',
                'Evaluasi pola makan harian',
            ],
        ];

        $statusNotes = $notes[$status] ?? ['Penimbangan rutin'];
        return $statusNotes[array_rand($statusNotes)] . ' - ' . $date->format('F Y');
    }
}
