<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\WeighingLog;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        // Children by nutritional status (optimized - single query with subquery)
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
        // Use a single query with subquery to get latest status for each child
        $latestStatuses = DB::table('children')
            ->leftJoin('weighing_logs', function ($join) {
                $join->on('children.id', '=', 'weighing_logs.child_id')
                    ->whereRaw('weighing_logs.id = (
                        SELECT id FROM weighing_logs wl2
                        WHERE wl2.child_id = children.id
                        ORDER BY wl2.measured_at DESC
                        LIMIT 1
                    )');
            })
            ->where('children.posyandu_id', $user->posyandu_id)
            ->where('children.is_active', true)
            ->whereNotNull('weighing_logs.nutritional_status')
            ->select('weighing_logs.nutritional_status')
            ->get();

        foreach ($latestStatuses as $row) {
            if (isset($childrenByStatus[$row->nutritional_status])) {
                $childrenByStatus[$row->nutritional_status]++;
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
     * Get paginated weighing history for kader's posyandu
     */
    public function history(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->posyandu_id) {
            return response()->json([
                'message' => 'Kader tidak memiliki posyandu yang terdaftar.',
            ], 400);
        }

        $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'child_id' => ['nullable', 'integer', 'exists:children,id'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
        ]);

        $perPage = $request->input('per_page', 20);

        // Get all children IDs in posyandu
        $childIds = Child::where('posyandu_id', $user->posyandu_id)
            ->pluck('id');

        // Build query
        $query = WeighingLog::with(['child'])
            ->whereIn('child_id', $childIds);

        // Apply filters
        if ($request->filled('child_id')) {
            $query->where('child_id', $request->input('child_id'));
        }

        if ($request->filled('start_date')) {
            $query->where('measured_at', '>=', $request->input('start_date'));
        }

        if ($request->filled('end_date')) {
            $query->where('measured_at', '<=', $request->input('end_date'));
        }

        // Get paginated results
        $weighings = $query->orderBy('measured_at', 'desc')
            ->paginate($perPage);

        // Transform data
        $data = $weighings->map(function ($weighing) {
            return [
                'id' => $weighing->id,
                'type' => 'weighing',
                'datetime' => $weighing->measured_at,
                'child_name' => $weighing->child ? $weighing->child->full_name : 'Unknown',
                'child_gender' => $weighing->child ? $weighing->child->gender : null,
                'child_id' => $weighing->child_id,
                'data' => [
                    'weight_kg' => $weighing->weight_kg,
                    'height_cm' => $weighing->height_cm,
                    'muac_cm' => $weighing->muac_cm,
                    'head_circumference_cm' => $weighing->head_circumference_cm,
                    'nutritional_status' => $weighing->nutritional_status,
                    'notes' => $weighing->notes,
                ],
            ];
        });

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $weighings->currentPage(),
                'per_page' => $weighings->perPage(),
                'total' => $weighings->total(),
                'last_page' => $weighings->lastPage(),
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
        $csvData = "Tanggal,Nama Anak,Berat (kg),Tinggi (cm),Lengan (cm),Kepala (cm),Status Gizi,Catatan\n";

        foreach ($weighings as $weighing) {
            $csvData .= sprintf(
                "%s,%s,%.1f,%.1f,%s,%s,%s,%s\n",
                Carbon::parse($weighing->measured_at)->format('Y-m-d'),
                $this->escapeCsv($weighing->child->full_name),
                $weighing->weight_kg,
                $weighing->height_cm,
                $weighing->muac_cm ? sprintf('%.1f', $weighing->muac_cm) : '-',
                $weighing->head_circumference_cm ? sprintf('%.1f', $weighing->head_circumference_cm) : '-',
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
