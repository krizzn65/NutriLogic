<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Child;
use App\Models\ImmunizationSchedule;
use Illuminate\Support\Carbon;

class ImmunizationScheduleSeeder extends Seeder
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

        foreach ($children as $child) {
            // Jadwal posyandu bulan depan
            ImmunizationSchedule::create([
                'child_id'     => $child->id,
                'title'        => 'Jadwal Posyandu Bulanan',
                'type'         => 'posyandu',
                'scheduled_for' => Carbon::now()->addMonth()->toDateString(),
                'completed_at' => null,
                'notes'        => 'Datang ke posyandu untuk penimbangan rutin.',
            ]);

            // Jadwal imunisasi (misal 2 minggu lagi)
            ImmunizationSchedule::create([
                'child_id'     => $child->id,
                'title'        => 'Imunisasi DPT Lanjutan',
                'type'         => 'imunisasi',
                'scheduled_for' => Carbon::now()->addWeeks(2)->toDateString(),
                'completed_at' => null,
                'notes'        => 'Pastikan anak dalam kondisi sehat saat imunisasi.',
            ]);

            // Jadwal vitamin (1 bulan lalu, sudah selesai)
            ImmunizationSchedule::create([
                'child_id'     => $child->id,
                'title'        => 'Pemberian Vitamin A',
                'type'         => 'vitamin',
                'scheduled_for' => Carbon::now()->subMonth()->toDateString(),
                'completed_at' => Carbon::now()->subMonth()->toDateString(),
                'notes'        => 'Vitamin A kapsul biru sudah diberikan.',
            ]);
        }
    }
}
