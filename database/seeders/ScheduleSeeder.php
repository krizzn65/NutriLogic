<?php

namespace Database\Seeders;

use App\Models\Posyandu;
use App\Models\ImmunizationSchedule;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates posyandu schedules (immunization, vitamin, posyandu events).
     */
    public function run(): void
    {
        $this->command->info('Creating Posyandu Schedules...');

        $posyandus = Posyandu::all();

        // Valid types: 'imunisasi', 'vitamin', 'posyandu'
        $scheduleTemplates = [
            ['title' => 'Posyandu Rutin - Penimbangan & Imunisasi', 'type' => 'posyandu', 'days' => 7],
            ['title' => 'Pemberian Vitamin A', 'type' => 'vitamin', 'days' => 14],
            ['title' => 'Imunisasi Campak & Rubella', 'type' => 'imunisasi', 'days' => 21],
            ['title' => 'Penyuluhan Gizi Seimbang', 'type' => 'posyandu', 'days' => 28],
            ['title' => 'Posyandu Rutin - Pemeriksaan Kesehatan', 'type' => 'posyandu', 'days' => -7],
            ['title' => 'Imunisasi DPT-HB-Hib', 'type' => 'imunisasi', 'days' => 35],
            ['title' => 'Pemeriksaan Tumbuh Kembang', 'type' => 'posyandu', 'days' => 42],
            ['title' => 'Posyandu Rutin Bulanan', 'type' => 'posyandu', 'days' => -14],
        ];

        $count = 0;
        foreach ($posyandus as $posyandu) {
            foreach ($scheduleTemplates as $template) {
                $scheduledFor = Carbon::now()->addDays($template['days'])->setTime(rand(8, 10), 0);
                $isCompleted = $template['days'] < 0;

                ImmunizationSchedule::create([
                    'child_id' => null,
                    'posyandu_id' => $posyandu->id,
                    'title' => $template['title'],
                    'type' => $template['type'],
                    'scheduled_for' => $scheduledFor,
                    'location' => $posyandu->name,
                    'completed_at' => $isCompleted ? $scheduledFor : null,
                    'notes' => $isCompleted ? 'Sudah dilaksanakan' : 'Harap membawa buku KIA',
                ]);
                $count++;
            }
        }

        $this->command->info("✓ Created {$count} Posyandu Schedules");
    }
}
