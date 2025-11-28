<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\WeighingLog;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class KaderReportController extends Controller
{
    /**
     * Get summary report for a date range
     */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->posyandu_id) {
            return response()->json([
                'message' => 'Kader tidak memiliki posyandu yang terdaftar.',
            ], 400);
        }

        // Default to current month if no dates provided
        $dateFrom = $request->input('date_from', Carbon::now()->startOfMonth()->toDateString());
        $dateTo = $request->input('date_to', Carbon::now()->endOfMonth()->toDateString());

        // Get all children IDs in posyandu
        $childIds = Child::where('posyandu_id', $user->posyandu_id)
            ->where('is_active', true)
            ->pluck('id');

        // Total weighings in period
        $totalWeighings = WeighingLog::whereIn('child_id', $childIds)
            ->whereBetween('measured_at', [$dateFrom, $dateTo])
            ->count();

        // Children by nutritional status (latest status for each child)
        $childrenByStatus = [
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

        foreach ($childIds as $childId) {
            $latestWeighing = WeighingLog::where('child_id', $childId)
                ->orderBy('measured_at', 'desc')
                ->first();

            if ($latestWeighing && isset($childrenByStatus[$latestWeighing->nutritional_status])) {
                $childrenByStatus[$latestWeighing->nutritional_status]++;
            }
        }

        // New children registered in period
        $newChildren = Child::where('posyandu_id', $user->posyandu_id)
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->count();

        // Total active children
        $totalActiveChildren = $childIds->count();

        return response()->json([
            'data' => [
                'period' => [
                    'from' => $dateFrom,
                    'to' => $dateTo,
                ],
                'total_weighings' => $totalWeighings,
                'children_by_status' => $childrenByStatus,
                'new_children' => $newChildren,
                'total_active_children' => $totalActiveChildren,
            ],
        ], 200);
    }

    /**
     * Export children data to CSV
     */
    public function exportChildren(Request $request)
    {
        $user = $request->user();

        if (!$user->posyandu_id) {
            return response()->json([
                'message' => 'Kader tidak memiliki posyandu yang terdaftar.',
            ], 400);
        }

        $children = Child::with(['parent'])
            ->where('posyandu_id', $user->posyandu_id)
            ->where('is_active', true)
            ->get();

        // Add latest status to each child
        $children->each(function ($child) {
            $latestWeighing = $child->weighingLogs()
                ->orderBy('measured_at', 'desc')
                ->first();

            $child->latest_status = $latestWeighing ? $latestWeighing->nutritional_status : 'Belum ada data';
        });

        // Generate CSV
        $csvData = "ID,Nama Lengkap,NIK,Tanggal Lahir,Jenis Kelamin,Nama Orang Tua,Status Gizi Terakhir\n";
        
        foreach ($children as $child) {
            $csvData .= sprintf(
                "%d,%s,%s,%s,%s,%s,%s\n",
                $child->id,
                $this->escapeCsv($child->full_name),
                $this->escapeCsv($child->nik ?? '-'),
                $child->birth_date,
                $child->gender,
                $this->escapeCsv($child->parent->name ?? '-'),
                $child->latest_status
            );
        }

        $filename = 'data_anak_' . Carbon::now()->format('Y-m-d_His') . '.csv';

        return Response::make($csvData, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Export weighing records to CSV
     */
    public function exportWeighings(Request $request)
    {
        $user = $request->user();

        if (!$user->posyandu_id) {
            return response()->json([
                'message' => 'Kader tidak memiliki posyandu yang terdaftar.',
            ], 400);
        }

        $validated = $request->validate([
            'date_from' => ['required', 'date'],
            'date_to' => ['required', 'date'],
        ]);

        // Get all children IDs in posyandu
        $childIds = Child::where('posyandu_id', $user->posyandu_id)
            ->pluck('id');

        $weighings = WeighingLog::with('child')
            ->whereIn('child_id', $childIds)
            ->whereBetween('measured_at', [$validated['date_from'], $validated['date_to']])
            ->orderBy('measured_at', 'desc')
            ->get();

        // Generate CSV
        $csvData = "Tanggal,Nama Anak,Berat (kg),Tinggi (cm),Status Gizi,Catatan\n";
        
        foreach ($weighings as $weighing) {
            $csvData .= sprintf(
                "%s,%s,%.1f,%.1f,%s,%s\n",
                Carbon::parse($weighing->measured_at)->format('Y-m-d'),
                $this->escapeCsv($weighing->child->full_name),
                $weighing->weight_kg,
                $weighing->height_cm,
                $weighing->nutritional_status,
                $this->escapeCsv($weighing->notes ?? '-')
            );
        }

        $filename = 'riwayat_penimbangan_' . Carbon::now()->format('Y-m-d_His') . '.csv';

        return Response::make($csvData, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Escape CSV values
     */
    private function escapeCsv($value)
    {
        if (strpos($value, ',') !== false || strpos($value, '"') !== false || strpos($value, "\n") !== false) {
            return '"' . str_replace('"', '""', $value) . '"';
        }
        return $value;
    }
}
