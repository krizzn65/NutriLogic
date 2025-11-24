<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\MealLog;
use App\Services\PointsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MealLogController extends Controller
{
    public function __construct(
        private PointsService $pointsService
    ) {
    }
    /**
     * Get meal logs for a child
     */
    public function index(Request $request, ?int $childId = null): JsonResponse
    {
        $user = $request->user();

        $query = MealLog::with('child');

        if ($childId) {
            $child = Child::findOrFail($childId);
            
            // Authorization check
            if ($user->isIbu() && $child->parent_id !== $user->id) {
                return response()->json([
                    'message' => 'Unauthorized access.',
                ], 403);
            }

            $query->where('child_id', $childId);
        } else {
            // Filter by user's access
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

        $logs = $query->orderBy('eaten_at', 'desc')->get();

        return response()->json([
            'data' => $logs,
        ], 200);
    }

    /**
     * Get single meal log
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $log = MealLog::with('child')->findOrFail($id);

        // Authorization check
        if ($user->isIbu() && $log->child->parent_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        return response()->json([
            'data' => $log,
        ], 200);
    }

    /**
     * Create new meal log
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'child_id' => ['required', 'integer', 'exists:children,id'],
            'eaten_at' => ['required', 'date'],
            'time_of_day' => ['nullable', 'string', 'in:pagi,siang,malam,snack'],
            'description' => ['required', 'string'],
            'ingredients' => ['nullable', 'string'],
            'source' => ['sometimes', 'string', 'in:ortu,kader,system'],
        ]);

        $child = Child::findOrFail($validated['child_id']);
        $user = $request->user();

        // Authorization check
        if ($user->isIbu() && $child->parent_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        // Set source based on user role
        if (!isset($validated['source'])) {
            $validated['source'] = $user->isIbu() ? 'ortu' : 'kader';
        }

        $log = MealLog::create($validated);

        // Add points and check badges for ibu role only
        if ($user->isIbu()) {
            $this->pointsService->addPoints($user, 5, 'meal_log');
        }

        return response()->json([
            'data' => $log->load('child'),
            'message' => 'Meal log created successfully.',
        ], 201);
    }

    /**
     * Update meal log
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $log = MealLog::with('child')->findOrFail($id);

        // Authorization check
        if ($user->isIbu() && $log->child->parent_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        $validated = $request->validate([
            'eaten_at' => ['sometimes', 'date'],
            'time_of_day' => ['nullable', 'string', 'in:pagi,siang,malam,snack'],
            'description' => ['sometimes', 'string'],
            'ingredients' => ['nullable', 'string'],
            'source' => ['sometimes', 'string', 'in:ortu,kader,system'],
        ]);

        $log->update($validated);

        return response()->json([
            'data' => $log->load('child'),
            'message' => 'Meal log updated successfully.',
        ], 200);
    }

    /**
     * Delete meal log
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $log = MealLog::with('child')->findOrFail($id);

        // Authorization check
        if ($user->isIbu() && $log->child->parent_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        $log->delete();

        return response()->json([
            'message' => 'Meal log deleted successfully.',
        ], 200);
    }
}

