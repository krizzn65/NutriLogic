<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\ImmunizationSchedule;
use App\Models\MealLog;
use App\Models\WeighingLog;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class ParentHistoryController extends Controller
{
    /**
     * Get combined history for parent (ibu)
     * 
     * Returns combined history of weighing logs, meal logs, and completed immunizations
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Authorization: only for ibu role
        if (!$user->isIbu()) {
            return response()->json([
                'message' => 'Unauthorized. This endpoint is only for parents.',
            ], 403);
        }

        // Get all children IDs for this parent
        $childIds = Child::where('parent_id', $user->id)
            ->where('is_active', true)
            ->pluck('id');

        if ($childIds->isEmpty()) {
            return response()->json([
                'data' => [],
                'meta' => [
                    'current_page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                    'last_page' => 1,
                ],
            ], 200);
        }

        // Get query parameters
        $childId = $request->input('child_id');
        $type = $request->input('type', 'all');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $perPage = min((int) $request->input('per_page', 20), 100);
        $page = (int) $request->input('page', 1);

        // Filter child IDs if specific child is selected
        $filteredChildIds = $childId ? [$childId] : $childIds->toArray();

        // Verify child belongs to parent if child_id is provided
        if ($childId && !$childIds->contains($childId)) {
            return response()->json([
                'message' => 'Unauthorized. Child does not belong to you.',
            ], 403);
        }

        // Collect all history items
        $historyItems = collect();

        // Get weighing logs
        if ($type === 'all' || $type === 'weighing') {
            $weighingQuery = WeighingLog::whereIn('child_id', $filteredChildIds)
                ->with('child:id,full_name');

            if ($startDate) {
                $weighingQuery->whereDate('measured_at', '>=', $startDate);
            }
            if ($endDate) {
                $weighingQuery->whereDate('measured_at', '<=', $endDate);
            }

            $weighingLogs = $weighingQuery->get();

            foreach ($weighingLogs as $log) {
                $historyItems->push([
                    'id' => $log->id,
                    'type' => 'weighing',
                    'date' => $log->measured_at->format('Y-m-d'),
                    'datetime' => $log->measured_at->format('Y-m-d H:i:s'),
                    'child_id' => $log->child_id,
                    'child_name' => $log->child->full_name ?? '',
                    'data' => [
                        'weight_kg' => $log->weight_kg,
                        'height_cm' => $log->height_cm,
                        'muac_cm' => $log->muac_cm,
                        'nutritional_status' => $log->nutritional_status,
                        'zscore_wfa' => $log->zscore_wfa,
                        'zscore_hfa' => $log->zscore_hfa,
                        'zscore_wfh' => $log->zscore_wfh,
                        'is_posyandu_day' => $log->is_posyandu_day,
                        'notes' => $log->notes,
                    ],
                ]);
            }
        }

        // Get meal logs
        if ($type === 'all' || $type === 'meal') {
            $mealQuery = MealLog::whereIn('child_id', $filteredChildIds)
                ->with('child:id,full_name');

            if ($startDate) {
                $mealQuery->whereDate('eaten_at', '>=', $startDate);
            }
            if ($endDate) {
                $mealQuery->whereDate('eaten_at', '<=', $endDate);
            }

            $mealLogs = $mealQuery->get();

            foreach ($mealLogs as $log) {
                $historyItems->push([
                    'id' => $log->id,
                    'type' => 'meal',
                    'date' => $log->eaten_at->format('Y-m-d'),
                    'datetime' => $log->eaten_at->format('Y-m-d H:i:s'),
                    'child_id' => $log->child_id,
                    'child_name' => $log->child->full_name ?? '',
                    'data' => [
                        'time_of_day' => $log->time_of_day,
                        'description' => $log->description,
                        'ingredients' => $log->ingredients,
                        'source' => $log->source,
                    ],
                ]);
            }
        }

        // Get completed immunizations
        if ($type === 'all' || $type === 'immunization') {
            $immunizationQuery = ImmunizationSchedule::whereIn('child_id', $filteredChildIds)
                ->whereNotNull('completed_at')
                ->with('child:id,full_name');

            if ($startDate) {
                $immunizationQuery->whereDate('completed_at', '>=', $startDate);
            }
            if ($endDate) {
                $immunizationQuery->whereDate('completed_at', '<=', $endDate);
            }

            $immunizations = $immunizationQuery->get();

            foreach ($immunizations as $immunization) {
                $historyItems->push([
                    'id' => $immunization->id,
                    'type' => 'immunization',
                    'date' => $immunization->completed_at->format('Y-m-d'),
                    'datetime' => $immunization->completed_at->format('Y-m-d H:i:s'),
                    'child_id' => $immunization->child_id,
                    'child_name' => $immunization->child->full_name ?? '',
                    'data' => [
                        'title' => $immunization->title,
                        'type' => $immunization->type,
                        'scheduled_for' => $immunization->scheduled_for ? $immunization->scheduled_for->format('Y-m-d') : null,
                        'notes' => $immunization->notes,
                    ],
                ]);
            }
        }

        // Sort by datetime DESC
        $historyItems = $historyItems->sortByDesc('datetime')->values();

        // Manual pagination
        $total = $historyItems->count();
        $lastPage = (int) ceil($total / $perPage);
        $offset = ($page - 1) * $perPage;
        $paginatedItems = $historyItems->slice($offset, $perPage)->values();

        return response()->json([
            'data' => $paginatedItems,
            'meta' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => $lastPage,
            ],
        ], 200);
    }
}

