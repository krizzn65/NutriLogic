<?php

namespace App\Http\Controllers;

use App\Models\Child;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChildController extends Controller
{
    /**
     * Get list of children
     * - Ibu: only their own children
     * - Kader/Admin: all children in their posyandu
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Child::with(['parent', 'posyandu']);

        if ($user->isIbu()) {
            // Ibu can only see their own children
            $query->where('parent_id', $user->id);
        } elseif ($user->isKader() || $user->isAdmin()) {
            // Kader/Admin can see all children in their posyandu
            if ($user->posyandu_id) {
                $query->where('posyandu_id', $user->posyandu_id);
            }
        }

        $children = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'data' => $children,
        ], 200);
    }

    /**
     * Get single child by ID
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $child = Child::with([
            'parent', 
            'posyandu', 
            'weighingLogs' => function ($query) {
                $query->orderBy('measured_at', 'desc');
            },
            'mealLogs' => function ($query) {
                $query->orderBy('eaten_at', 'desc');
            },
            'immunizationSchedules',
            'vitaminDistributions' => function ($query) {
                $query->orderBy('distribution_date', 'desc');
            },
            'immunizationRecords' => function ($query) {
                $query->orderBy('immunization_date', 'desc');
            },
            'pmtLogs' => function ($query) {
                $query->orderBy('date', 'desc');
            },
        ])
            ->findOrFail($id);

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

        return response()->json([
            'data' => $child,
        ], 200);
    }

    /**
     * Create new child
     * - Ibu: can create children for themselves
     * - Kader/Admin: can create children for any parent in their posyandu
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'parent_id' => ['required', 'integer', 'exists:users,id'],
            'posyandu_id' => ['required', 'integer', 'exists:posyandus,id'],
            'full_name' => ['required', 'string', 'max:150'],
            'nik' => ['nullable', 'string', 'max:32', 'unique:children,nik'],
            'birth_date' => ['required', 'date'],
            'gender' => ['required', 'string', 'in:L,P'],
            'birth_weight_kg' => ['nullable', 'numeric', 'min:0', 'max:10'],
            'birth_height_cm' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'notes' => ['nullable', 'string'],
        ]);

        // Authorization: Ibu can only create for themselves
        if ($user->isIbu() && $validated['parent_id'] !== $user->id) {
            return response()->json([
                'message' => 'You can only register children for yourself.',
            ], 403);
        }

        // Authorization: Kader/Admin must be in same posyandu
        if (($user->isKader() || $user->isAdmin()) && $user->posyandu_id && $validated['posyandu_id'] !== $user->posyandu_id) {
            return response()->json([
                'message' => 'You can only register children in your posyandu.',
            ], 403);
        }

        $child = Child::create($validated);

        // Log activity
        AdminActivityLogController::log('create', "{$user->name} mendaftarkan anak: {$child->full_name}", 'Child', $child->id);

        return response()->json([
            'data' => $child->load(['parent', 'posyandu']),
            'message' => 'Child registered successfully.',
        ], 201);
    }

    /**
     * Update child
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $child = Child::findOrFail($id);

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

        $validated = $request->validate([
            'full_name' => ['sometimes', 'string', 'max:150'],
            'nik' => ['nullable', 'string', 'max:32', 'unique:children,nik,' . $id],
            'birth_date' => ['sometimes', 'date'],
            'gender' => ['sometimes', 'string', 'in:L,P'],
            'birth_weight_kg' => ['nullable', 'numeric', 'min:0', 'max:10'],
            'birth_height_cm' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $child->update($validated);

        $child->update($validated);

        // Log activity
        AdminActivityLogController::log('update', "{$user->name} memperbarui data anak: {$child->full_name}", 'Child', $child->id);

        return response()->json([
            'data' => $child->load(['parent', 'posyandu']),
            'message' => 'Child updated successfully.',
        ], 200);
    }

    /**
     * Delete child (soft delete by setting is_active = false)
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $child = Child::findOrFail($id);

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

        $child->update(['is_active' => false]);

        // Log activity
        AdminActivityLogController::log('delete', "{$user->name} menonaktifkan anak: {$child->full_name}", 'Child', $child->id);

        return response()->json([
            'message' => 'Child deactivated successfully.',
        ], 200);
    }

    /**
     * Get growth chart data for a child
     */
    public function growthChart(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $child = Child::findOrFail($id);

        // Authorization check
        if ($user->isIbu() && $child->parent_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        $weighingLogs = $child->weighingLogs()
            ->orderBy('measured_at', 'asc')
            ->get();

        return response()->json([
            'data' => [
                'child' => $child,
                'weighing_logs' => $weighingLogs,
            ],
        ], 200);
    }

    /**
     * Get current nutritional status
     */
    public function nutritionalStatus(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $child = Child::findOrFail($id);

        // Authorization check
        if ($user->isIbu() && $child->parent_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        $latestWeighing = $child->weighingLogs()
            ->orderBy('measured_at', 'desc')
            ->first();

        if (!$latestWeighing) {
            return response()->json([
                'data' => [
                    'status' => 'no_data',
                    'message' => 'No weighing data available.',
                ],
            ], 200);
        }

        return response()->json([
            'data' => [
                'zscore_wfa' => $latestWeighing->zscore_wfa,
                'zscore_hfa' => $latestWeighing->zscore_hfa,
                'zscore_wfh' => $latestWeighing->zscore_wfh,
                'nutritional_status' => $latestWeighing->nutritional_status,
                'measured_at' => $latestWeighing->measured_at,
                'weight_kg' => $latestWeighing->weight_kg,
                'height_cm' => $latestWeighing->height_cm,
            ],
        ], 200);
    }

    /**
     * Get health reminders for a child
     */
    public function reminders(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $child = Child::findOrFail($id);

        // Authorization check
        if ($user->isIbu() && $child->parent_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        $now = now();
        $thirtyDaysFromNow = $now->copy()->addDays(30);

        // Get upcoming immunization schedules
        $schedules = $child->immunizationSchedules()
            ->where('scheduled_for', '>=', $now)
            ->where('scheduled_for', '<=', $thirtyDaysFromNow)
            ->whereNull('completed_at')
            ->orderBy('scheduled_for', 'asc')
            ->get();

        $reminders = $schedules->map(function ($schedule) use ($now) {
            $daysUntil = $now->diffInDays($schedule->scheduled_for, false);
            return [
                'id' => $schedule->id,
                'title' => $schedule->title,
                'type' => $schedule->type,
                'scheduled_for' => $schedule->scheduled_for->format('Y-m-d'),
                'days_until' => $daysUntil,
                'is_urgent' => $daysUntil <= 7,
            ];
        });

        return response()->json([
            'data' => $reminders,
        ], 200);
    }
}
