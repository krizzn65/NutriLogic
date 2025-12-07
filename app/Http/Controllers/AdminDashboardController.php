<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\Posyandu;
use App\Models\User;
use App\Models\WeighingLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    /**
     * Get dashboard statistics for SuperAdmin
     */
    public function index(Request $request): JsonResponse
    {
        $posyanduId = $request->query('posyandu_id');

        // Total counts
        $posyanduQuery = Posyandu::where('is_active', true);
        $kaderQuery = User::where('role', 'kader');
        $ibuQuery = User::where('role', 'ibu');
        $anakQuery = Child::query();

        if ($posyanduId) {
            $posyanduQuery->where('id', $posyanduId);
            $kaderQuery->where('posyandu_id', $posyanduId);
            $ibuQuery->where('posyandu_id', $posyanduId);
            $anakQuery->where('posyandu_id', $posyanduId);
        }

        $totalPosyandu = $posyanduQuery->count();
        $totalKader = $kaderQuery->count();
        $totalIbu = $ibuQuery->count();
        $totalAnak = $anakQuery->count();

        // Get nutritional status distribution
        $statusDistribution = $this->getNutritionalStatusDistribution($posyanduId);

        // Get top 5 posyandu with highest risk children
        // If specific posyandu is selected, this might just return that one if it has risks, or we can keep showing top 5 globally or filter.
        // Let's filter it to show risks for the selected posyandu if selected, or top 5 if not.
        $topRiskPosyandu = $this->getTopRiskPosyandu($posyanduId);

        return response()->json([
            'data' => [
                'total_posyandu' => $totalPosyandu,
                'total_kader' => $totalKader,
                'total_ibu' => $totalIbu,
                'total_anak' => $totalAnak,
                'status_distribution' => $statusDistribution,
                'top_risk_posyandu' => $topRiskPosyandu,
                'monthly_trend' => $this->getMonthlyTrend($posyanduId),
                'growth_by_posyandu' => $this->getGrowthByPosyandu($posyanduId),
            ],
        ], 200);
    }

    /**
     * Get nutritional status distribution across all children
     */
    private function getNutritionalStatusDistribution($posyanduId = null): array
    {
        $distribution = [
            'normal' => 0,
            'kurang' => 0,
            'sangat_kurang' => 0,
            'pendek' => 0,
            'sangat_pendek' => 0,
            'kurus' => 0,
            'sangat_kurus' => 0,
            'lebih' => 0,
            'gemuk' => 0,
        ];

        // Get latest weighing for each child based on measured_at
        $latestWeighingsQuery = WeighingLog::select('weighing_logs.child_id', 'weighing_logs.nutritional_status')
            ->join('children', 'weighing_logs.child_id', '=', 'children.id')
            ->whereIn('weighing_logs.id', function ($query) {
                $query->select('wl.id')
                    ->from('weighing_logs as wl')
                    ->join(DB::raw('(SELECT child_id, MAX(measured_at) as max_date FROM weighing_logs GROUP BY child_id) as latest'),
                        function ($join) {
                            $join->on('wl.child_id', '=', 'latest.child_id')
                                ->on('wl.measured_at', '=', 'latest.max_date');
                        });
            });

        if ($posyanduId) {
            $latestWeighingsQuery->where('children.posyandu_id', $posyanduId);
        }

        $latestWeighings = $latestWeighingsQuery->get();

        foreach ($latestWeighings as $weighing) {
            $status = $weighing->nutritional_status;
            if (isset($distribution[$status])) {
                $distribution[$status]++;
            }
        }

        return $distribution;
    }

    /**
     * Get top 5 posyandu with highest number of at-risk children
     */
    private function getTopRiskPosyandu($posyanduId = null): array
    {
        // Get latest weighing for each child with their posyandu based on measured_at
        $riskCountsQuery = DB::table('weighing_logs as wl')
            ->select('p.id', 'p.name', DB::raw('COUNT(DISTINCT c.id) as risk_count'))
            ->join(DB::raw('(SELECT child_id, MAX(measured_at) as max_date FROM weighing_logs GROUP BY child_id) as latest'), 
                function ($join) {
                    $join->on('wl.child_id', '=', 'latest.child_id')
                        ->on('wl.measured_at', '=', 'latest.max_date');
                })
            ->join('children as c', 'wl.child_id', '=', 'c.id')
            ->join('posyandus as p', 'c.posyandu_id', '=', 'p.id')
            ->whereIn('wl.nutritional_status', [
                'kurang', 
                'sangat_kurang', 
                'pendek', 
                'sangat_pendek', 
                'kurus', 
                'sangat_kurus'
            ]);

        if ($posyanduId) {
            $riskCountsQuery->where('p.id', $posyanduId);
        }

        $riskCounts = $riskCountsQuery->groupBy('p.id', 'p.name')
            ->orderByDesc('risk_count')
            ->limit(5)
            ->get();

        return $riskCounts->map(function ($item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'risk_count' => $item->risk_count,
            ];
        })->toArray();
    }
    /**
     * Get growth statistics by posyandu (monthly breakdown for last 12 months)
     */
    private function getGrowthByPosyandu($posyanduId = null): array
    {
        // Generate monthly data for last 12 months
        $monthlyData = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthStart = $date->copy()->startOfMonth()->format('Y-m-d');
            $monthEnd = $date->copy()->endOfMonth()->format('Y-m-d');

            $query = DB::table('weighing_logs as wl')
                ->select(
                    DB::raw('COUNT(DISTINCT wl.child_id) as children_count'),
                    DB::raw('COUNT(wl.id) as weighings_count')
                )
                ->join('children as c', 'wl.child_id', '=', 'c.id')
                ->whereBetween('wl.measured_at', [$monthStart, $monthEnd]);

            if ($posyanduId) {
                $query->where('c.posyandu_id', $posyanduId);
            }

            $result = $query->first();

            $monthlyData[] = [
                'month' => $date->format('M Y'),
                'children_count' => $result->children_count ?? 0,
                'weighings_count' => $result->weighings_count ?? 0,
            ];
        }

        return $monthlyData;
    }

    /**
     * Get monthly trend for last 12 months
     */
    private function getMonthlyTrend($posyanduId = null): array
    {
        $months = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthStart = $date->copy()->startOfMonth()->format('Y-m-d');
            $monthEnd = $date->copy()->endOfMonth()->format('Y-m-d');

            $query = WeighingLog::whereBetween('measured_at', [$monthStart, $monthEnd]);

            if ($posyanduId) {
                $query->join('children', 'weighing_logs.child_id', '=', 'children.id')
                    ->where('children.posyandu_id', $posyanduId);
            }

            $weighingsCount = $query->count();

            $months[] = [
                'month' => $date->format('M Y'),
                'weighings_count' => $weighingsCount,
            ];
        }

        return $months;
    }
}
