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

        $scheduleTypes = [
            [
                'title' => 'Jadwal Posyandu Bulanan',
                'type' => 'posyandu',
                'offset_days' => 30,
                'notes' => 'Datang ke posyandu untuk penimbangan rutin.',
            ],
            [
                'title' => 'Imunisasi Hepatitis B',
                'type' => 'imunisasi',
                'offset_days' => 15,
                'notes' => 'Pastikan anak dalam kondisi sehat saat imunisasi.',
            ],
            [
                'title' => 'Imunisasi BCG',
                'type' => 'imunisasi',
                'offset_days' => 20,
                'notes' => 'Imunisasi pencegahan TBC.',
            ],
            [
                'title' => 'Imunisasi DPT',
                'type' => 'imunisasi',
                'offset_days' => 25,
                'notes' => 'Difteri, Pertusis, Tetanus.',
            ],
            [
                'title' => 'Imunisasi Polio',
                'type' => 'imunisasi',
                'offset_days' => 18,
                'notes' => 'Vaksin polio tetes.',
            ],
            [
                'title' => 'Pemberian Vitamin A',
                'type' => 'vitamin',
                'offset_days' => -30,
                'notes' => 'Vitamin A kapsul merah/biru sesuai usia.',
                'completed' => true,
            ],
            [
                'title' => 'Imunisasi Campak',
                'type' => 'imunisasi',
                'offset_days' => 35,
                'notes' => 'Vaksin pencegahan campak.',
            ],
        ];

        foreach ($children as $child) {
            // Buat 3-5 jadwal untuk setiap anak
            $scheduleCount = rand(3, 5);
            $selectedSchedules = array_rand($scheduleTypes, min($scheduleCount, count($scheduleTypes)));

            if (!is_array($selectedSchedules)) {
                $selectedSchedules = [$selectedSchedules];
            }

            foreach ($selectedSchedules as $index) {
                $schedule = $scheduleTypes[$index];
                $scheduledDate = Carbon::now()->addDays($schedule['offset_days']);

                ImmunizationSchedule::create([
                    'child_id'     => $child->id,
                    'title'        => $schedule['title'],
                    'type'         => $schedule['type'],
                    'scheduled_for' => $scheduledDate->toDateString(),
                    'completed_at' => isset($schedule['completed']) && $schedule['completed']
                        ? $scheduledDate->toDateString()
                        : null,
                    'notes'        => $schedule['notes'],
                ]);
            }
        }
    }
}
