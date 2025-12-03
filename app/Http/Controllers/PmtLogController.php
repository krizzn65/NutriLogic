<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\PmtLog;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PmtLogController extends Controller
{
    /**
     * Get PMT logs for a child (monthly view)
     */
    public function index(Request $request, int $childId): JsonResponse
    {
        $user = $request->user();
        $child = Child::findOrFail($childId);

        // Authorization
        if ($user->isIbu() && $child->parent_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        $month = $request->query('month', Carbon::now()->month);
        $year = $request->query('year', Carbon::now()->year);

        $logs = PmtLog::where('child_id', $childId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->orderBy('date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }

    /**
     * Store or update PMT log for a specific date
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'child_id' => ['required', 'integer', 'exists:children,id'],
            'date' => ['required', 'date'],
            'status' => ['required', 'in:consumed,partial,refused'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $child = Child::findOrFail($validated['child_id']);
        $user = $request->user();

        // Authorization
        if ($user->isIbu() && $child->parent_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        // Use updateOrCreate to handle both insert and update
        $log = PmtLog::updateOrCreate(
            [
                'child_id' => $validated['child_id'],
                'date' => $validated['date'],
            ],
            [
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? null,
            ]
        );

        return response()->json([
            'success' => true,
            'data' => $log,
            'message' => 'PMT log saved successfully.',
        ], 201);
    }

    /**
     * Get PMT stats for a child
     */
    public function stats(Request $request, int $childId): JsonResponse
    {
        $user = $request->user();
        $child = Child::findOrFail($childId);

        // Authorization
        if ($user->isIbu() && $child->parent_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        $month = $request->query('month', Carbon::now()->month);
        $year = $request->query('year', Carbon::now()->year);
        
        $currentMonth = Carbon::create($year, $month, 1);
        $totalDays = $currentMonth->daysInMonth;
        
        $consumedCount = PmtLog::where('child_id', $childId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->where('status', 'consumed')
            ->count();

        $partialCount = PmtLog::where('child_id', $childId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->where('status', 'partial')
            ->count();

        $refusedCount = PmtLog::where('child_id', $childId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->where('status', 'refused')
            ->count();

        $totalLogged = $consumedCount + $partialCount + $refusedCount;
        $complianceRate = $totalLogged > 0 ? round(($consumedCount / $totalLogged) * 100, 1) : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'month' => $currentMonth->format('F Y'),
                'total_days' => $totalDays,
                'consumed' => $consumedCount,
                'partial' => $partialCount,
                'refused' => $refusedCount,
                'total_logged' => $totalLogged,
                'compliance_rate' => $complianceRate,
            ],
        ]);
    }
}
