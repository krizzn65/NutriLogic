<?php

namespace App\Services;

use App\Models\Child;
use Carbon\Carbon;

class PriorityChildService
{
    /**
     * Get all priority children in a posyandu
     */
    public function getPriorityChildren(int $posyanduId): array
    {
        $children = Child::with(['parent', 'weighingLogs'])
            ->where('posyandu_id', $posyanduId)
            ->where('is_active', true)
            ->get();

        $priorityChildren = [];
        $summary = [
            'total_priority' => 0,
            'by_reason' => [
                'bad_nutritional_status' => 0,
                'weight_stagnation' => 0,
                'long_absence' => 0,
            ],
        ];

        foreach ($children as $child) {
            $reasons = $this->checkPriorityCriteria($child);
            
            if (!empty($reasons)) {
                $latestWeighing = $child->weighingLogs()
                    ->orderBy('measured_at', 'desc')
                    ->first();

                $daysSinceLastWeighing = null;
                if ($latestWeighing) {
                    $daysSinceLastWeighing = Carbon::parse($latestWeighing->measured_at)
                        ->diffInDays(Carbon::now());
                }

                $priorityChildren[] = [
                    'id' => $child->id,
                    'full_name' => $child->full_name,
                    'age_in_months' => $child->age_in_months,
                    'gender' => $child->gender,
                    'parent' => [
                        'name' => $child->parent->name ?? null,
                        'phone' => $child->parent->phone ?? null,
                    ],
                    'latest_weighing' => $latestWeighing ? [
                        'measured_at' => $latestWeighing->measured_at,
                        'weight_kg' => $latestWeighing->weight_kg,
                        'height_cm' => $latestWeighing->height_cm,
                        'muac_cm' => $latestWeighing->muac_cm,
                        'head_circumference_cm' => $latestWeighing->head_circumference_cm,
                        'nutritional_status' => $latestWeighing->nutritional_status,
                    ] : null,
                    'priority_reasons' => $reasons,
                    'days_since_last_weighing' => $daysSinceLastWeighing,
                ];

                $summary['total_priority']++;
                foreach ($reasons as $reason) {
                    $summary['by_reason'][$reason['type']]++;
                }
            }
        }

        return [
            'children' => $priorityChildren,
            'summary' => $summary,
        ];
    }

    /**
     * Check all priority criteria for a child
     */
    private function checkPriorityCriteria(Child $child): array
    {
        $reasons = [];

        // Check nutritional status
        if ($this->checkNutritionalStatus($child)) {
            $reasons[] = [
                'type' => 'bad_nutritional_status',
                'label' => 'Status Gizi Buruk',
                'severity' => 'high',
            ];
        }

        // Check weight stagnation
        if ($this->checkWeightStagnation($child)) {
            $reasons[] = [
                'type' => 'weight_stagnation',
                'label' => 'Berat Badan Stagnan',
                'severity' => 'medium',
            ];
        }

        // Check long absence
        $absenceWeeks = $this->checkAbsence($child);
        if ($absenceWeeks > 0) {
            $reasons[] = [
                'type' => 'long_absence',
                'label' => "Tidak Ditimbang {$absenceWeeks} Minggu",
                'severity' => 'medium',
            ];
        }

        return $reasons;
    }

    /**
     * Check if child has bad nutritional status
     */
    private function checkNutritionalStatus(Child $child): bool
    {
        $latestWeighing = $child->weighingLogs()
            ->orderBy('measured_at', 'desc')
            ->first();

        if (!$latestWeighing) {
            return false;
        }

        // Any status except 'normal' is considered bad
        return $latestWeighing->nutritional_status !== 'normal';
    }

    /**
     * Check if child's weight has stagnated
     */
    private function checkWeightStagnation(Child $child): bool
    {
        $recentWeighings = $child->weighingLogs()
            ->orderBy('measured_at', 'desc')
            ->limit(3)
            ->get();

        // Need at least 3 weighing records to check stagnation
        if ($recentWeighings->count() < 3) {
            return false;
        }

        // Check if weight has not increased for last 2 visits
        // Tolerance: ±0.1 kg for measurement variance
        $weights = $recentWeighings->pluck('weight_kg')->toArray();
        
        // Compare most recent with second most recent
        $noIncrease1 = ($weights[0] - $weights[1]) <= 0.1;
        
        // Compare second most recent with third most recent
        $noIncrease2 = ($weights[1] - $weights[2]) <= 0.1;

        return $noIncrease1 && $noIncrease2;
    }

    /**
     * Check if child has been absent from weighing for too long
     * Returns number of weeks if absent, 0 if not
     */
    private function checkAbsence(Child $child, int $weeksThreshold = 4): int
    {
        $latestWeighing = $child->weighingLogs()
            ->orderBy('measured_at', 'desc')
            ->first();

        if (!$latestWeighing) {
            // No weighing data at all - check child's age
            $ageInDays = Carbon::parse($child->birth_date)->diffInDays(Carbon::now());
            $ageInWeeks = floor($ageInDays / 7);
            
            // If child is older than threshold, flag as absent
            if ($ageInWeeks > $weeksThreshold) {
                return (int) $ageInWeeks;
            }
            return 0;
        }

        $daysSinceLastWeighing = Carbon::parse($latestWeighing->measured_at)
            ->diffInDays(Carbon::now());
        
        $weeksSinceLastWeighing = floor($daysSinceLastWeighing / 7);

        if ($weeksSinceLastWeighing >= $weeksThreshold) {
            return (int) $weeksSinceLastWeighing;
        }

        return 0;
    }
}
