<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\WeighingLog;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AtRiskController extends Controller
{
    /**
     * Get children at risk
     * Flags children if:
     * - Z-score drops > 0.5 in last 2 months
     * - Nutritional status worsens (normal → pendek/kurang)
     * - No update > 3 months
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get children based on user role
        $query = Child::with(['parent', 'posyandu']);

        if ($user->isIbu()) {
            $query->where('parent_id', $user->id);
        } elseif ($user->isKader() || $user->isAdmin()) {
            if ($user->posyandu_id) {
                $query->where('posyandu_id', $user->posyandu_id);
            }
        }

        $children = $query->with(['weighingLogs' => function ($q) {
            $q->orderBy('measured_at', 'desc')->limit(2);
        }])->get();

        $atRiskChildren = [];

        foreach ($children as $child) {
            $risks = [];
            $riskLevel = 'low';

            $weighingLogs = $child->weighingLogs;
            
            if ($weighingLogs->count() >= 2) {
                $latest = $weighingLogs->first();
                $previous = $weighingLogs->last();

                // Check Z-score drop
                if ($latest->zscore_hfa && $previous->zscore_hfa) {
                    $zscoreDrop = $latest->zscore_hfa - $previous->zscore_hfa;
                    if ($zscoreDrop < -0.5) {
                        $risks[] = [
                            'type' => 'zscore_drop',
                            'message' => 'Z-Score HFA turun ' . abs($zscoreDrop) . ' dalam 2 bulan terakhir',
                            'severity' => 'high',
                        ];
                        $riskLevel = 'high';
                    }
                }

                // Check nutritional status worsening
                $statusMap = [
                    'normal' => 0,
                    'kurang' => 1,
                    'pendek' => 1,
                    'kurus' => 1,
                    'sangat_kurang' => 2,
                    'sangat_pendek' => 2,
                    'sangat_kurus' => 2,
                ];

                $latestStatus = $statusMap[$latest->nutritional_status] ?? 0;
                $previousStatus = $statusMap[$previous->nutritional_status] ?? 0;

                if ($latestStatus > $previousStatus) {
                    $risks[] = [
                        'type' => 'status_worsening',
                        'message' => 'Status gizi memburuk: ' . $previous->nutritional_status . ' → ' . $latest->nutritional_status,
                        'severity' => 'high',
                    ];
                    $riskLevel = 'high';
                }
            }

            // Check if no update > 3 months
            $latestWeighing = $weighingLogs->first();
            if ($latestWeighing) {
                $daysSinceLastUpdate = Carbon::parse($latestWeighing->measured_at)->diffInDays(now());
                if ($daysSinceLastUpdate > 90) {
                    $risks[] = [
                        'type' => 'no_update',
                        'message' => 'Tidak ada update selama ' . round($daysSinceLastUpdate / 30) . ' bulan',
                        'severity' => 'medium',
                    ];
                    if ($riskLevel === 'low') {
                        $riskLevel = 'medium';
                    }
                }
            } else {
                // No weighing logs at all
                $daysSinceBirth = Carbon::parse($child->birth_date)->diffInDays(now());
                if ($daysSinceBirth > 90) {
                    $risks[] = [
                        'type' => 'no_data',
                        'message' => 'Belum ada data pengukuran sejak lahir',
                        'severity' => 'medium',
                    ];
                    if ($riskLevel === 'low') {
                        $riskLevel = 'medium';
                    }
                }
            }

            // Check current status
            if ($latestWeighing) {
                $currentStatus = $latestWeighing->nutritional_status;
                if (in_array($currentStatus, ['sangat_pendek', 'sangat_kurang', 'sangat_kurus'])) {
                    $risks[] = [
                        'type' => 'critical_status',
                        'message' => 'Status gizi: ' . $currentStatus,
                        'severity' => 'high',
                    ];
                    $riskLevel = 'high';
                } elseif (in_array($currentStatus, ['pendek', 'kurang', 'kurus'])) {
                    $risks[] = [
                        'type' => 'at_risk_status',
                        'message' => 'Status gizi: ' . $currentStatus,
                        'severity' => 'medium',
                    ];
                    if ($riskLevel === 'low') {
                        $riskLevel = 'medium';
                    }
                }
            }

            if (count($risks) > 0) {
                $atRiskChildren[] = [
                    'child' => $child,
                    'risks' => $risks,
                    'risk_level' => $riskLevel,
                    'latest_weighing' => $latestWeighing,
                ];
            }
        }

        // Sort by risk level (high first)
        usort($atRiskChildren, function ($a, $b) {
            $levelOrder = ['high' => 3, 'medium' => 2, 'low' => 1];
            return $levelOrder[$b['risk_level']] - $levelOrder[$a['risk_level']];
        });

        return response()->json([
            'data' => $atRiskChildren,
            'count' => count($atRiskChildren),
        ], 200);
    }
}

