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
        $totalWeighings = $weighingQuery->count();

        // Nutritional status distribution (latest weighing per child)
        $statusDistribution = $this->getNutritionalStatusDistribution();

        // Growth by posyandu
        $growthByPosyandu = $this->getGrowthByPosyandu($dateFrom, $dateTo);

        // Monthly trend (last 6 months)
        $monthlyTrend = $this->getMonthlyTrend();

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

        switch ($type) {
            case 'children':
                return $this->exportChildren();
            case 'weighings':
                return $this->exportWeighings($dateFrom, $dateTo);
            default:
                return $this->exportSummary();
        }
    }

    /**
     * Get nutritional status distribution
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
     * Get growth statistics by posyandu
     */
    private function getGrowthByPosyandu($dateFrom, $dateTo): array
    {
        $query = DB::table('weighing_logs as wl')
            ->select(
                'p.id',
                'p.name',
                DB::raw('COUNT(DISTINCT wl.child_id) as children_count'),
                DB::raw('COUNT(wl.id) as weighings_count')
            )
            ->join('children as c', 'wl.child_id', '=', 'c.id')
            ->join('posyandus as p', 'c.posyandu_id', '=', 'p.id');

        if ($dateFrom && $dateTo) {
            $query->whereBetween('wl.measured_at', [$dateFrom, $dateTo]);
        }

        return $query->groupBy('p.id', 'p.name')
            ->orderBy('weighings_count', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'posyandu_name' => $item->name,
                    'children_count' => $item->children_count,
                    'weighings_count' => $item->weighings_count,
                ];
            })
            ->toArray();
    }

    /**
     * Get monthly trend for last 6 months
     */
    private function getMonthlyTrend(): array
    {
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthStart = $date->copy()->startOfMonth()->format('Y-m-d');
            $monthEnd = $date->copy()->endOfMonth()->format('Y-m-d');

            $weighingsCount = WeighingLog::whereBetween('measured_at', [$monthStart, $monthEnd])->count();

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
    private function exportChildren()
    {
        $children = Child::with(['parent', 'posyandu'])->get();

        $csvData = "ID,Nama Anak,Jenis Kelamin,Tanggal Lahir,Nama Orang Tua,Posyandu\n";

        foreach ($children as $child) {
            $csvData .= sprintf(
                "%d,%s,%s,%s,%s,%s\n",
                $child->id,
                $this->escapeCsv($child->full_name),
                $child->gender === 'L' ? 'Laki-laki' : 'Perempuan',
                $child->date_of_birth ?? '-',
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
    private function exportWeighings($dateFrom, $dateTo)
    {
        $query = WeighingLog::with(['child.parent', 'child.posyandu']);

        if ($dateFrom && $dateTo) {
            $query->whereBetween('measured_at', [$dateFrom, $dateTo]);
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
