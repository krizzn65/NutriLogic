<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\WeighingLog;
use App\Services\PointsService;
use App\Services\ZScoreService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WeighingLogController extends Controller
{
    protected ZScoreService $zScoreService;
    protected PointsService $pointsService;

    public function __construct(ZScoreService $zScoreService, PointsService $pointsService)
    {
        $this->zScoreService = $zScoreService;
        $this->pointsService = $pointsService;
    }

    /**
     * Get weighing logs for a child
     */
    public function index(Request $request, ?int $childId = null): JsonResponse
    {
        $user = $request->user();

        $query = WeighingLog::with('child');

        if ($childId) {
            $child = Child::findOrFail($childId);

            // Authorization check
            if ($user->isIbu() && $child->parent_id !== $user->id) {
                return response()->json([
                    'message' => 'Unauthorized access.',
                ], 403);
            }

            if (($user->isKader() || $user->isAdmin()) && $user->posyandu_id && $child->posyandu_id !== $user->posyandu_id) {
                return response()->json([
                    'message' => 'Unauthorized access.',
                ], 403);
            }

            $query->where('child_id', $childId);
        } else {
            // If no child_id, filter by user's access
            if ($user->isIbu()) {
                $childIds = $user->children()->pluck('id');
                $query->whereIn('child_id', $childIds);
            } elseif ($user->isKader() || $user->isAdmin()) {
                if ($user->posyandu_id) {
                    $childIds = Child::where('posyandu_id', $user->posyandu_id)->pluck('id');
                    $query->whereIn('child_id', $childIds);
                }
            }
        }

        $logs = $query->orderBy('measured_at', 'desc')->get();

        return response()->json([
            'data' => $logs,
        ], 200);
    }

    /**
     * Get single weighing log
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $log = WeighingLog::with('child')->findOrFail($id);

        // Authorization check
        if ($user->isIbu() && $log->child->parent_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        if (($user->isKader() || $user->isAdmin()) && $user->posyandu_id && $log->child->posyandu_id !== $user->posyandu_id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        return response()->json([
            'data' => $log,
        ], 200);
    }

    /**
     * Create new weighing log with auto Z-score calculation
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'child_id' => ['required', 'integer', 'exists:children,id'],
            'measured_at' => ['required', 'date'],
            'weight_kg' => ['required', 'numeric', 'min:0.5', 'max:50'],
            'height_cm' => ['nullable', 'numeric', 'min:30', 'max:200'],
            'muac_cm' => ['nullable', 'numeric', 'min:5', 'max:30'],
            'head_circumference_cm' => ['nullable', 'numeric', 'min:25', 'max:60'],
            'is_posyandu_day' => ['sometimes', 'boolean'],
            'notes' => ['nullable', 'string'],
        ]);

        $child = Child::findOrFail($validated['child_id']);
        $user = $request->user();

        // Authorization check
        if ($user->isIbu() && $child->parent_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        if (($user->isKader() || $user->isAdmin()) && $user->posyandu_id && $child->posyandu_id !== $user->posyandu_id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        // Calculate age in days
        $measurementDate = Carbon::parse($validated['measured_at']);
        $ageInDays = $this->zScoreService->calculateAgeInDays($child->birth_date, $measurementDate);

        // Calculate Z-scores
        $zScoreWFA = null;
        $zScoreHFA = null;
        $zScoreWFH = null;

        if ($validated['weight_kg']) {
            $zScoreWFA = $this->zScoreService->calculateWFA($ageInDays, $validated['weight_kg'], $child->gender);
        }

        if (isset($validated['height_cm']) && $validated['height_cm']) {
            $zScoreHFA = $this->zScoreService->calculateHFA($ageInDays, $validated['height_cm'], $child->gender);

            if ($validated['weight_kg']) {
                $zScoreWFH = $this->zScoreService->calculateWFH($validated['height_cm'], $validated['weight_kg'], $child->gender);
            }
        }

        // Get nutritional status
        $nutritionalStatus = $this->zScoreService->getOverallStatus($zScoreHFA, $zScoreWFH, $zScoreWFA);

        // Create weighing log
        $log = WeighingLog::create([
            'child_id' => $validated['child_id'],
            'measured_at' => $validated['measured_at'],
            'weight_kg' => $validated['weight_kg'],
            'height_cm' => $validated['height_cm'] ?? null,
            'muac_cm' => $validated['muac_cm'] ?? null,
            'head_circumference_cm' => $validated['head_circumference_cm'] ?? null,
            'zscore_wfa' => $zScoreWFA,
            'zscore_hfa' => $zScoreHFA,
            'zscore_wfh' => $zScoreWFH,
            'nutritional_status' => $nutritionalStatus,
            'is_posyandu_day' => $validated['is_posyandu_day'] ?? true,
            'notes' => $validated['notes'] ?? null,
        ]);

        // Add points and check badges for ibu role only
        if ($user->isIbu()) {
            $this->pointsService->addPoints($user, 10, 'weighing_log');
        }

        return response()->json([
            'data' => $log->load('child'),
            'message' => 'Weighing log created successfully.',
        ], 201);
    }

    /**
     * Update weighing log
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $log = WeighingLog::with('child')->findOrFail($id);

        // Authorization check
        if ($user->isIbu() && $log->child->parent_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        $validated = $request->validate([
            'measured_at' => ['sometimes', 'date'],
            'weight_kg' => ['sometimes', 'numeric', 'min:0.5', 'max:50'],
            'height_cm' => ['nullable', 'numeric', 'min:30', 'max:200'],
            'muac_cm' => ['nullable', 'numeric', 'min:5', 'max:30'],
            'head_circumference_cm' => ['nullable', 'numeric', 'min:25', 'max:60'],
            'is_posyandu_day' => ['sometimes', 'boolean'],
            'notes' => ['nullable', 'string'],
        ]);

        // Recalculate Z-scores if weight or height changed
        $child = $log->child;
        $weight = $validated['weight_kg'] ?? $log->weight_kg;
        $height = $validated['height_cm'] ?? $log->height_cm;
        $measuredAt = isset($validated['measured_at']) ? Carbon::parse($validated['measured_at']) : $log->measured_at;

        $ageInDays = $this->zScoreService->calculateAgeInDays($child->birth_date, $measuredAt);

        $zScoreWFA = null;
        $zScoreHFA = null;
        $zScoreWFH = null;

        if ($weight) {
            $zScoreWFA = $this->zScoreService->calculateWFA($ageInDays, $weight, $child->gender);
        }

        if ($height) {
            $zScoreHFA = $this->zScoreService->calculateHFA($ageInDays, $height, $child->gender);

            if ($weight) {
                $zScoreWFH = $this->zScoreService->calculateWFH($height, $weight, $child->gender);
            }
        }

        $nutritionalStatus = $this->zScoreService->getOverallStatus($zScoreHFA, $zScoreWFH, $zScoreWFA);

        $log->update(array_merge($validated, [
            'zscore_wfa' => $zScoreWFA,
            'zscore_hfa' => $zScoreHFA,
            'zscore_wfh' => $zScoreWFH,
            'nutritional_status' => $nutritionalStatus,
        ]));

        return response()->json([
            'data' => $log->load('child'),
            'message' => 'Weighing log updated successfully.',
        ], 200);
    }

    /**
     * Delete weighing log
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $log = WeighingLog::with('child')->findOrFail($id);

        // Authorization check
        if ($user->isIbu() && $log->child->parent_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        $log->delete();

        return response()->json([
            'message' => 'Weighing log deleted successfully.',
        ], 200);
    }
}
