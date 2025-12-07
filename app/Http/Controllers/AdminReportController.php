<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\Posyandu;
use App\Models\User;
use App\Models\WeighingLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminReportController extends Controller
{
    /**
     * Get system-wide statistics for reports
     */
    public function index(Request $request): JsonResponse
    {
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $posyanduId = $request->input('posyandu_id');

        // Total counts
        $totalPosyandu = Posyandu::where('is_active', true)->count();
        $totalKader = User::where('role', 'kader')->count();
        $totalIbu = User::where('role', 'ibu')->count();
        $totalAnak = Child::count();

        // Weighing statistics
        $weighingQuery = WeighingLog::query();
        if ($dateFrom && $dateTo) {
            $weighingQuery->whereBetween('measured_at', [$dateFrom, $dateTo]);
        }
        if ($posyanduId) {
            $weighingQuery->whereHas('child', function ($q) use ($posyanduId) {
                $q->where('posyandu_id', $posyanduId);
            });
        }
        $totalWeighings = $weighingQuery->count();

        // Nutritional status distribution (latest weighing per child)
        $statusDistribution = $this->getNutritionalStatusDistribution($posyanduId);

        // Monthly trend (last 12 months)
        $monthlyTrend = $this->getMonthlyTrend($posyanduId);

        // Yearly growth by posyandu
        $growthByPosyandu = $this->getGrowthByPosyandu($posyanduId);

        return response()->json([
            'data' => [
                'summary' => [
                    'total_posyandu' => $totalPosyandu,
                    'total_kader' => $totalKader,
                    'total_ibu' => $totalIbu,
                    'total_anak' => $totalAnak,
                    'total_weighings' => $totalWeighings,
                ],
                'status_distribution' => $statusDistribution,
                'growth_by_posyandu' => $growthByPosyandu,
                'monthly_trend' => $monthlyTrend,
            ],
        ], 200);
    }

    /**
     * Export report data as CSV
     */
    public function export(Request $request)
    {
        $type = $request->input('type', 'summary'); // summary, children, weighings
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $posyanduId = $request->input('posyandu_id');

        // Log export action
        AdminActivityLogController::log(
            'export',
            "Admin mengexport laporan {$type}",
            'Report',
            null,
            [
                'export_type' => $type,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'posyandu_id' => $posyanduId,
            ]
        );

        switch ($type) {
            case 'children':
                return $this->exportChildren($posyanduId);
            case 'weighings':
                return $this->exportWeighings($dateFrom, $dateTo, $posyanduId);
            default:
                return $this->exportSummary();
        }
    }

    /**
     * Get nutritional status distribution
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

        $query = WeighingLog::select('child_id', 'nutritional_status')
            ->whereIn('id', function ($query) {
                $query->select('wl.id')
                    ->from('weighing_logs as wl')
                    ->join(DB::raw('(SELECT child_id, MAX(measured_at) as max_date FROM weighing_logs GROUP BY child_id) as latest'),
                        function ($join) {
                            $join->on('wl.child_id', '=', 'latest.child_id')
                                ->on('wl.measured_at', '=', 'latest.max_date');
                        });
            });

        if ($posyanduId) {
            $query->whereHas('child', function ($q) use ($posyanduId) {
                $q->where('posyandu_id', $posyanduId);
            });
        }

        $latestWeighings = $query->get();

        foreach ($latestWeighings as $weighing) {
            $status = $weighing->nutritional_status;
            if (isset($distribution[$status])) {
                $distribution[$status]++;
            }
        }

        return $distribution;
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

            $weighingQuery = WeighingLog::whereBetween('measured_at', [$monthStart, $monthEnd]);
            
            if ($posyanduId) {
                $weighingQuery->whereHas('child', function ($q) use ($posyanduId) {
                    $q->where('posyandu_id', $posyanduId);
                });
            }
            
            $weighingsCount = $weighingQuery->count();

            $months[] = [
                'month' => $date->format('M Y'),
                'weighings_count' => $weighingsCount,
            ];
        }

        return $months;
    }

    /**
     * Export children data as CSV
     */
    private function exportChildren($posyanduId = null)
    {
        $query = Child::with(['parent', 'posyandu']);

        if ($posyanduId) {
            $query->where('posyandu_id', $posyanduId);
        }

        $children = $query->get();

        $csvData = "ID,Nama Anak,Jenis Kelamin,Tanggal Lahir,Nama Orang Tua,Posyandu\n";

        foreach ($children as $child) {
            $csvData .= sprintf(
                "%d,%s,%s,%s,%s,%s\n",
                $child->id,
                $this->escapeCsv($child->full_name),
                $child->gender === 'L' ? 'Laki-laki' : 'Perempuan',
                $child->birth_date ? $child->birth_date->format('Y-m-d') : '-',
                $this->escapeCsv($child->parent->name ?? '-'),
                $this->escapeCsv($child->posyandu->name ?? '-')
            );
        }

        return response($csvData, 200)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="data-anak-' . now()->format('Y-m-d') . '.csv"');
    }

    /**
     * Export weighings data as CSV
     */
    private function exportWeighings($dateFrom, $dateTo, $posyanduId = null)
    {
        $query = WeighingLog::with(['child.parent', 'child.posyandu']);

        if ($dateFrom && $dateTo) {
            $query->whereBetween('measured_at', [$dateFrom, $dateTo]);
        }

        if ($posyanduId) {
            $query->whereHas('child', function ($q) use ($posyanduId) {
                $q->where('posyandu_id', $posyanduId);
            });
        }

        $weighings = $query->orderBy('measured_at', 'desc')->get();

        $csvData = "ID,Tanggal,Nama Anak,Berat (kg),Tinggi (cm),Status Gizi,Posyandu\n";

        foreach ($weighings as $weighing) {
            $csvData .= sprintf(
                "%d,%s,%s,%.1f,%.1f,%s,%s\n",
                $weighing->id,
                $weighing->measured_at,
                $this->escapeCsv($weighing->child->full_name ?? '-'),
                $weighing->weight_kg,
                $weighing->height_cm ?? 0,
                $this->escapeCsv($weighing->nutritional_status ?? '-'),
                $this->escapeCsv($weighing->child->posyandu->name ?? '-')
            );
        }

        return response($csvData, 200)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="data-penimbangan-' . now()->format('Y-m-d') . '.csv"');
    }

    /**
     * Export summary report as CSV
     */
    private function exportSummary()
    {
        $statusDistribution = $this->getNutritionalStatusDistribution();

        $csvData = "Laporan Ringkasan Sistem NutriLogic\n";
        $csvData .= "Tanggal Export: " . now()->format('Y-m-d H:i:s') . "\n\n";

        $csvData .= "Total Posyandu," . Posyandu::where('is_active', true)->count() . "\n";
        $csvData .= "Total Kader," . User::where('role', 'kader')->count() . "\n";
        $csvData .= "Total Orang Tua," . User::where('role', 'ibu')->count() . "\n";
        $csvData .= "Total Anak," . Child::count() . "\n";
        $csvData .= "Total Penimbangan," . WeighingLog::count() . "\n\n";

        $csvData .= "Distribusi Status Gizi\n";
        $csvData .= "Status,Jumlah\n";
        foreach ($statusDistribution as $status => $count) {
            $csvData .= ucfirst(str_replace('_', ' ', $status)) . "," . $count . "\n";
        }

        return response($csvData, 200)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="laporan-ringkasan-' . now()->format('Y-m-d') . '.csv"');
    }

    /**
     * Escape CSV values
     */
    private function escapeCsv($value): string
    {
        if (strpos($value, ',') !== false || strpos($value, '"') !== false) {
            return '"' . str_replace('"', '""', $value) . '"';
        }
        return $value;
    }
}
