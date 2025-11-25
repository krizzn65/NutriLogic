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
        // Total counts
        $totalPosyandu = Posyandu::where('is_active', true)->count();
        $totalKader = User::where('role', 'kader')->count();
        $totalIbu = User::where('role', 'ibu')->count();
        $totalAnak = Child::count();

        // Get nutritional status distribution
        $statusDistribution = $this->getNutritionalStatusDistribution();

        // Get top 5 posyandu with highest risk children
        $topRiskPosyandu = $this->getTopRiskPosyandu();

        return response()->json([
            'data' => [
                'total_posyandu' => $totalPosyandu,
                'total_kader' => $totalKader,
                'total_ibu' => $totalIbu,
                'total_anak' => $totalAnak,
                'status_distribution' => $statusDistribution,
                'top_risk_posyandu' => $topRiskPosyandu,
            ],
        ], 200);
    }

    /**
     * Get nutritional status distribution across all children
     */
    private function getNutritionalStatusDistribution(): array
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

        // Get latest weighing for each child
        $latestWeighings = WeighingLog::select('child_id', 'nutritional_status')
            ->whereIn('id', function ($query) {
                $query->select(DB::raw('MAX(id)'))
                    ->from('weighing_logs')
                    ->groupBy('child_id');
            })
            ->get();

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
    private function getTopRiskPosyandu(): array
    {
        // Get latest weighing for each child with their posyandu
        $riskCounts = DB::table('weighing_logs as wl')
            ->select('p.id', 'p.name', DB::raw('COUNT(DISTINCT c.id) as risk_count'))
            ->join(DB::raw('(SELECT child_id, MAX(id) as max_id FROM weighing_logs GROUP BY child_id) as latest'), 
                'wl.id', '=', 'latest.max_id')
            ->join('children as c', 'wl.child_id', '=', 'c.id')
            ->join('posyandus as p', 'c.posyandu_id', '=', 'p.id')
            ->whereIn('wl.nutritional_status', [
                'kurang', 
                'sangat_kurang', 
                'pendek', 
                'sangat_pendek', 
                'kurus', 
                'sangat_kurus'
            ])
            ->groupBy('p.id', 'p.name')
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
}
