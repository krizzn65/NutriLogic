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

        $validated = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'month' => ['nullable', 'integer', 'between:1,12'],
            'year' => ['nullable', 'integer', 'min:2020', 'max:2030'],
        ]);

        // Determine date range based on filters
        if ($validated['month'] ?? null && $validated['year'] ?? null) {
            // Month/year filter takes precedence
            $dateFrom = Carbon::createFromDate($validated['year'], $validated['month'], 1)->startOfMonth()->toDateString();
            $dateTo = Carbon::createFromDate($validated['year'], $validated['month'], 1)->endOfMonth()->toDateString();
        } elseif ($validated['date_from'] ?? null && $validated['date_to'] ?? null) {
            // Use custom date range
            $dateFrom = $validated['date_from'];
            $dateTo = $validated['date_to'];
        } else {
            // Default to current month
            $dateFrom = Carbon::now()->startOfMonth()->toDateString();
            $dateTo = Carbon::now()->endOfMonth()->toDateString();
        }

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
        $latestStatuses = \DB::table('children')
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

        $validated = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'child_id' => ['nullable', 'integer', 'exists:children,id'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'month' => ['nullable', 'integer', 'between:1,12'],
            'year' => ['nullable', 'integer', 'min:2020', 'max:2030'],
            'status' => ['nullable', 'string', 'in:normal,kurang,sangat_kurang,pendek,sangat_pendek,kurus,sangat_kurus,lebih,gemuk'],
        ]);

        $perPage = $validated['per_page'] ?? 20;

        // Get all children IDs in posyandu
        $childIds = Child::where('posyandu_id', $user->posyandu_id)
            ->pluck('id');

        // Build query
        $query = WeighingLog::with(['child'])
            ->whereIn('child_id', $childIds);

        // Apply filters
        if ($validated['child_id'] ?? null) {
            $query->where('child_id', $validated['child_id']);
        }

        // Date filtering with month/year priority
        if (($validated['month'] ?? null) && ($validated['year'] ?? null)) {
            $startOfMonth = Carbon::createFromDate($validated['year'], $validated['month'], 1)->startOfMonth();
            $endOfMonth = Carbon::createFromDate($validated['year'], $validated['month'], 1)->endOfMonth();
            $query->whereBetween('measured_at', [$startOfMonth, $endOfMonth]);
        } else {
            if ($validated['start_date'] ?? null) {
                $query->where('measured_at', '>=', $validated['start_date']);
            }
            if ($validated['end_date'] ?? null) {
                $query->where('measured_at', '<=', $validated['end_date']);
            }
        }

        // Status filter
        if ($validated['status'] ?? null) {
            $query->where('nutritional_status', $validated['status']);
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
