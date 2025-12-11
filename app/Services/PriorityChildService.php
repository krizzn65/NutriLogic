<?php

namespace App\Services;

use App\Models\Child;
use Carbon\Carbon;

class PriorityChildService
{
    /**
     * Get all children eligible for priority queue based on PMT compliance
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
                'pmt_compliant' => 0,
                'long_absence' => 0,
            ],
        ];

        foreach ($children as $child) {
            // Calculate PMT compliance for current month
            $pmtCompliance = $this->calculatePMTCompliance($child);
            $isEligible = $pmtCompliance >= 80;

            // Only include children who are eligible (≥80% PMT compliance)
            if ($isEligible) {
                $latestWeighing = $child->weighingLogs()
                    ->orderBy('measured_at', 'desc')
                    ->first();

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
                    'pmt_compliance_percentage' => $pmtCompliance,
                    'is_eligible_priority' => $isEligible,
                ];

                $summary['total_priority']++;
                $summary['by_reason']['pmt_compliant']++;
            }
        }

        return [
            'children' => $priorityChildren,
            'summary' => $summary,
        ];
    }

    /**
     * Calculate PMT compliance percentage for current month
     * Returns percentage (0-100) of PMT consumption days
     * Public method for use in other controllers
     */
    public function calculatePMTCompliancePublic(Child $child): float
    {
        return $this->calculatePMTCompliance($child);
    }

    /**
     * Calculate PMT compliance percentage for PREVIOUS MONTH (complete month)
     * Returns percentage (0-100) of PMT consumption days
     * Only counts complete months to ensure fair evaluation
     */
    private function calculatePMTCompliance(Child $child): float
    {
        // Get PREVIOUS month (complete month)
        $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth();
        $endOfLastMonth = Carbon::now()->subMonth()->endOfMonth();
        
        // Get total days in previous month
        $daysInLastMonth = $startOfLastMonth->daysInMonth;

        // Get PMT logs for PREVIOUS month
        // Only count 'consumed' status (not 'partial' or 'refused')
        $pmtLogs = $child->pmtLogs()
            ->whereBetween('date', [$startOfLastMonth, $endOfLastMonth])
            ->where('status', 'consumed')
            ->get();

        // Count unique consumption days
        $consumptionDays = $pmtLogs->pluck('date')
            ->map(function ($date) {
                return Carbon::parse($date)->format('Y-m-d');
            })
            ->unique()
            ->count();

        // Calculate percentage
        if ($daysInLastMonth == 0) {
            return 0;
        }

        $percentage = ($consumptionDays / $daysInLastMonth) * 100;
        
        return round($percentage, 1);
    }
}

