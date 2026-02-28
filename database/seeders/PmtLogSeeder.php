<?php

namespace Database\Seeders;

use App\Models\Child;
use App\Models\PmtLog;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PmtLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates PMT logs with various compliance rates for eligibility testing.
     * 
     * PMT compliance types:
     * - full = 100% (all days consumed) - ELIGIBLE
     * - high = 85-95% - ELIGIBLE
     * - medium = 70-79% - NOT ELIGIBLE
     * - low = 50-69% - NOT ELIGIBLE
     * - very_low = 30-49% - NOT ELIGIBLE
     */
    public function run(): void
    {
        $this->command->info('Creating PMT Logs...');

        $children = Child::all();

        // PMT eligibility is based on PREVIOUS month (>=80% consumed = eligible)
        $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth();
        $daysInLastMonth = $startOfLastMonth->daysInMonth;

        $this->command->info("Creating PMT logs for: " . $startOfLastMonth->format('F Y') . " ({$daysInLastMonth} days)");

        $eligibleCount = 0;
        $notEligibleCount = 0;

        foreach ($children as $child) {
            // Determine PMT type from notes field
            $pmtType = 'medium';
            if (preg_match('/PMT type: (\w+)/', $child->notes ?? '', $matches)) {
                $pmtType = $matches[1];
            }

            switch ($pmtType) {
                case 'full':
                    // 100% compliance - all days consumed
                    for ($i = 0; $i < $daysInLastMonth; $i++) {
                        PmtLog::create([
                            'child_id' => $child->id,
                            'date' => $startOfLastMonth->copy()->addDays($i)->format('Y-m-d'),
                            'status' => 'consumed',
                            'notes' => 'Habis semua',
                        ]);
                    }
                    $eligibleCount++;
                    break;

                case 'high':
                    // 85-95% compliance
                    $missedDays = rand(2, 5);
                    $missedIndices = array_rand(range(0, $daysInLastMonth - 1), $missedDays);
                    if (!is_array($missedIndices)) $missedIndices = [$missedIndices];

                    for ($i = 0; $i < $daysInLastMonth; $i++) {
                        if (!in_array($i, $missedIndices)) {
                            PmtLog::create([
                                'child_id' => $child->id,
                                'date' => $startOfLastMonth->copy()->addDays($i)->format('Y-m-d'),
                                'status' => 'consumed',
                                'notes' => 'Makan dengan lahap',
                            ]);
                        }
                    }
                    $eligibleCount++;
                    break;

                case 'medium':
                    // 70-79% compliance - NOT ELIGIBLE
                    $consumedDays = (int)($daysInLastMonth * (rand(70, 79) / 100));
                    $consumedIndices = array_rand(range(0, $daysInLastMonth - 1), $consumedDays);
                    if (!is_array($consumedIndices)) $consumedIndices = [$consumedIndices];

                    for ($i = 0; $i < $daysInLastMonth; $i++) {
                        $status = in_array($i, $consumedIndices) ? 'consumed' : ['partial', 'refused'][rand(0, 1)];
                        PmtLog::create([
                            'child_id' => $child->id,
                            'date' => $startOfLastMonth->copy()->addDays($i)->format('Y-m-d'),
                            'status' => $status,
                            'notes' => $status === 'consumed' ? 'Habis' : 'Tidak mau makan',
                        ]);
                    }
                    $notEligibleCount++;
                    break;

                case 'low':
                    // 50-69% compliance - NOT ELIGIBLE
                    $consumedDays = (int)($daysInLastMonth * (rand(50, 69) / 100));
                    $consumedIndices = array_rand(range(0, $daysInLastMonth - 1), $consumedDays);
                    if (!is_array($consumedIndices)) $consumedIndices = [$consumedIndices];

                    for ($i = 0; $i < $daysInLastMonth; $i++) {
                        if (in_array($i, $consumedIndices)) {
                            PmtLog::create([
                                'child_id' => $child->id,
                                'date' => $startOfLastMonth->copy()->addDays($i)->format('Y-m-d'),
                                'status' => 'consumed',
                                'notes' => 'Makan sedikit',
                            ]);
                        } else {
                            PmtLog::create([
                                'child_id' => $child->id,
                                'date' => $startOfLastMonth->copy()->addDays($i)->format('Y-m-d'),
                                'status' => 'refused',
                                'notes' => 'Menolak makan',
                            ]);
                        }
                    }
                    $notEligibleCount++;
                    break;

                case 'very_low':
                    // 30-49% compliance - NOT ELIGIBLE
                    $consumedDays = (int)($daysInLastMonth * (rand(30, 49) / 100));
                    $consumedIndices = array_rand(range(0, $daysInLastMonth - 1), max(1, $consumedDays));
                    if (!is_array($consumedIndices)) $consumedIndices = [$consumedIndices];

                    for ($i = 0; $i < $daysInLastMonth; $i++) {
                        if (in_array($i, $consumedIndices)) {
                            PmtLog::create([
                                'child_id' => $child->id,
                                'date' => $startOfLastMonth->copy()->addDays($i)->format('Y-m-d'),
                                'status' => rand(0, 1) ? 'consumed' : 'partial',
                                'notes' => 'Porsi tidak habis',
                            ]);
                        }
                    }
                    $notEligibleCount++;
                    break;
            }
        }

        // Also create some PMT logs for current month (partial data)
        $startOfCurrentMonth = Carbon::now()->startOfMonth();
        $currentDay = Carbon::now()->day;

        foreach ($children as $child) {
            for ($i = 0; $i < min($currentDay, 15); $i++) {
                if (rand(0, 1)) {
                    PmtLog::create([
                        'child_id' => $child->id,
                        'date' => $startOfCurrentMonth->copy()->addDays($i)->format('Y-m-d'),
                        'status' => ['consumed', 'partial', 'refused'][rand(0, 2)],
                        'notes' => 'Data bulan ini',
                    ]);
                }
            }
        }

        $this->command->info("✓ PMT Eligible (>=80%): {$eligibleCount} children");
        $this->command->info("✓ PMT Not Eligible (<80%): {$notEligibleCount} children");
    }
}
