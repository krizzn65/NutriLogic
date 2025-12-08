<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\WeighingLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KaderWeighingController extends Controller
{
    /**
     * Get list of children for today's weighing session
     */
    public function todayList(Request $request): JsonResponse
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

        // Add latest weighing data for each child
        $children->each(function ($child) {
            $latestWeighing = $child->weighingLogs()
                ->orderBy('measured_at', 'desc')
                ->first();

            $child->latest_weighing = $latestWeighing ? [
                'measured_at' => $latestWeighing->measured_at,
                'weight_kg' => $latestWeighing->weight_kg,
                'height_cm' => $latestWeighing->height_cm,
                'muac_cm' => $latestWeighing->muac_cm,
                'nutritional_status' => $latestWeighing->nutritional_status,
            ] : null;
        });

        return response()->json([
            'data' => $children,
        ], 200);
    }

    /**
     * Bulk store weighing data
     */
    public function bulkStore(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->posyandu_id) {
            return response()->json([
                'message' => 'Kader tidak memiliki posyandu yang terdaftar.',
            ], 400);
        }

        $validated = $request->validate([
            'weighings' => ['required', 'array', 'min:1'],
            'weighings.*.child_id' => ['required', 'integer', 'exists:children,id'],
            'weighings.*.measured_at' => ['required', 'date'],
            'weighings.*.weight_kg' => ['required', 'numeric', 'min:0', 'max:100'],
            'weighings.*.height_cm' => ['required', 'numeric', 'min:0', 'max:200'],
            'weighings.*.muac_cm' => ['nullable', 'numeric', 'min:0', 'max:50'],
            'weighings.*.head_circumference_cm' => ['nullable', 'numeric', 'min:0', 'max:60'],
            'weighings.*.notes' => ['nullable', 'string', 'max:500'],
        ]);

        // Validate all children belong to kader's posyandu
        $childIds = collect($validated['weighings'])->pluck('child_id')->unique();
        $validChildren = Child::where('posyandu_id', $user->posyandu_id)
            ->whereIn('id', $childIds)
            ->pluck('id');

        if ($validChildren->count() !== $childIds->count()) {
            return response()->json([
                'message' => 'Beberapa anak tidak terdaftar di posyandu Anda.',
            ], 403);
        }

        $savedWeighings = [];

        DB::beginTransaction();
        try {
            foreach ($validated['weighings'] as $weighingData) {
                // Z-scores and nutritional_status will be auto-calculated by model event
                $weighing = WeighingLog::create([
                    'child_id' => $weighingData['child_id'],
                    'measured_at' => $weighingData['measured_at'],
                    'weight_kg' => $weighingData['weight_kg'],
                    'height_cm' => $weighingData['height_cm'],
                    'muac_cm' => $weighingData['muac_cm'] ?? null,
                    'head_circumference_cm' => $weighingData['head_circumference_cm'] ?? null,
                    'notes' => $weighingData['notes'] ?? null,
                ]);

                $savedWeighings[] = $weighing;
            }

            DB::commit();

            return response()->json([
                'data' => $savedWeighings,
                'message' => count($savedWeighings) . ' data penimbangan berhasil disimpan.',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Gagal menyimpan data penimbangan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get weighing history for a specific child
     */
    public function childHistory(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $child = Child::findOrFail($id);

        // Authorization: child must be in kader's posyandu
        if ($user->posyandu_id && $child->posyandu_id !== $user->posyandu_id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        $weighings = WeighingLog::where('child_id', $id)
            ->orderBy('measured_at', 'desc')
            ->get();

        return response()->json([
            'data' => [
                'child' => [
                    'id' => $child->id,
                    'full_name' => $child->full_name,
                    'birth_date' => $child->birth_date,
                    'gender' => $child->gender,
                ],
                'weighings' => $weighings,
            ],
        ], 200);
    }
}
