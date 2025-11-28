<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\ImmunizationSchedule;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KaderScheduleController extends Controller
{
    /**
     * Get list of schedules for children in kader's posyandu
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->posyandu_id) {
            return response()->json([
                'message' => 'Kader tidak memiliki posyandu yang terdaftar.',
            ], 400);
        }

        // Get all children IDs in kader's posyandu
        $childIds = Child::where('posyandu_id', $user->posyandu_id)
            ->where('is_active', true)
            ->pluck('id');

        $query = ImmunizationSchedule::with(['child.parent'])
            ->whereIn('child_id', $childIds);

        // Filter by type
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        // Filter by specific child
        if ($request->has('child_id') && $request->child_id) {
            $query->where('child_id', $request->child_id);
        }

        // Filter by date range
        if ($request->has('date_from') && $request->date_from) {
            $query->where('scheduled_for', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->where('scheduled_for', '<=', $request->date_to);
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $today = Carbon::today();
            
            switch ($request->status) {
                case 'completed':
                    $query->whereNotNull('completed_at');
                    break;
                case 'upcoming':
                    $query->whereNull('completed_at')
                        ->where('scheduled_for', '>=', $today);
                    break;
                case 'overdue':
                    $query->whereNull('completed_at')
                        ->where('scheduled_for', '<', $today);
                    break;
            }
        }

        $schedules = $query->orderBy('scheduled_for', 'asc')->get();

        // Add status to each schedule
        $schedules->each(function ($schedule) {
            $schedule->status = $this->getScheduleStatus($schedule);
        });

        return response()->json([
            'data' => $schedules,
        ], 200);
    }

    /**
     * Create new schedule
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->posyandu_id) {
            return response()->json([
                'message' => 'Kader tidak memiliki posyandu yang terdaftar.',
            ], 400);
        }

        $validated = $request->validate([
            'child_id' => ['required', 'integer', 'exists:children,id'],
            'title' => ['required', 'string', 'max:150'],
            'type' => ['required', 'string', 'in:imunisasi,vitamin,posyandu'],
            'scheduled_for' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        // Validate child belongs to kader's posyandu
        $child = Child::findOrFail($validated['child_id']);
        if ($child->posyandu_id !== $user->posyandu_id) {
            return response()->json([
                'message' => 'Anak tidak terdaftar di posyandu Anda.',
            ], 403);
        }

        $schedule = ImmunizationSchedule::create([
            'child_id' => $validated['child_id'],
            'title' => $validated['title'],
            'type' => $validated['type'],
            'scheduled_for' => $validated['scheduled_for'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'data' => $schedule->load('child'),
            'message' => 'Jadwal berhasil ditambahkan.',
        ], 201);
    }

    /**
     * Update schedule
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $schedule = ImmunizationSchedule::with('child')->findOrFail($id);

        // Authorization: schedule's child must be in kader's posyandu
        if ($user->posyandu_id && $schedule->child->posyandu_id !== $user->posyandu_id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:150'],
            'type' => ['sometimes', 'string', 'in:imunisasi,vitamin,posyandu'],
            'scheduled_for' => ['sometimes', 'date'],
            'notes' => ['nullable', 'string', 'max:500'],
            'completed_at' => ['nullable', 'date'],
        ]);

        $schedule->update($validated);

        $schedule->status = $this->getScheduleStatus($schedule);

        return response()->json([
            'data' => $schedule->load('child'),
            'message' => 'Jadwal berhasil diperbarui.',
        ], 200);
    }

    /**
     * Delete schedule
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $schedule = ImmunizationSchedule::with('child')->findOrFail($id);

        // Authorization
        if ($user->posyandu_id && $schedule->child->posyandu_id !== $user->posyandu_id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        $schedule->delete();

        return response()->json([
            'message' => 'Jadwal berhasil dihapus.',
        ], 200);
    }

    /**
     * Determine schedule status
     */
    private function getScheduleStatus(ImmunizationSchedule $schedule): string
    {
        if ($schedule->completed_at) {
            return 'completed';
        }

        $today = Carbon::today();
        $scheduledDate = Carbon::parse($schedule->scheduled_for);

        if ($scheduledDate->lt($today)) {
            return 'overdue';
        }

        return 'upcoming';
    }
}
