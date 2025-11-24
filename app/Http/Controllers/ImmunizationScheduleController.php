<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\ImmunizationSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ImmunizationScheduleController extends Controller
{
    /**
     * Get immunization schedules for a child
     */
    public function index(Request $request, ?int $childId = null): JsonResponse
    {
        $user = $request->user();

        $query = ImmunizationSchedule::with('child');

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

        $schedules = $query->orderBy('scheduled_for', 'asc')->get();

        return response()->json([
            'data' => $schedules,
        ], 200);
    }

    /**
     * Get single immunization schedule
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $schedule = ImmunizationSchedule::with('child')->findOrFail($id);

        // Authorization check
        if ($user->isIbu() && $schedule->child->parent_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        return response()->json([
            'data' => $schedule,
        ], 200);
    }

    /**
     * Create new immunization schedule
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'child_id' => ['required', 'integer', 'exists:children,id'],
            'title' => ['required', 'string', 'max:150'],
            'type' => ['required', 'string', 'in:imunisasi,vitamin,posyandu'],
            'scheduled_for' => ['required', 'date'],
            'completed_at' => ['nullable', 'date'],
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

        $schedule = ImmunizationSchedule::create($validated);

        return response()->json([
            'data' => $schedule->load('child'),
            'message' => 'Immunization schedule created successfully.',
        ], 201);
    }

    /**
     * Update immunization schedule
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $schedule = ImmunizationSchedule::with('child')->findOrFail($id);

        // Authorization check
        if ($user->isIbu() && $schedule->child->parent_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:150'],
            'type' => ['sometimes', 'string', 'in:imunisasi,vitamin,posyandu'],
            'scheduled_for' => ['sometimes', 'date'],
            'completed_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $schedule->update($validated);

        return response()->json([
            'data' => $schedule->load('child'),
            'message' => 'Immunization schedule updated successfully.',
        ], 200);
    }

    /**
     * Delete immunization schedule
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $schedule = ImmunizationSchedule::with('child')->findOrFail($id);

        // Authorization check
        if ($user->isIbu() && $schedule->child->parent_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        $schedule->delete();

        return response()->json([
            'message' => 'Immunization schedule deleted successfully.',
        ], 200);
    }
}

