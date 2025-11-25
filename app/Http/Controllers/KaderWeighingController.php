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
                $child = Child::find($weighingData['child_id']);
                
                // Calculate nutritional status
                $nutritionalStatus = $this->calculateNutritionalStatus(
                    $child,
                    $weighingData['weight_kg'],
                    $weighingData['height_cm'],
                    $weighingData['measured_at']
                );

                $weighing = WeighingLog::create([
                    'child_id' => $weighingData['child_id'],
                    'measured_at' => $weighingData['measured_at'],
                    'weight_kg' => $weighingData['weight_kg'],
                    'height_cm' => $weighingData['height_cm'],
                    'nutritional_status' => $nutritionalStatus,
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

    /**
     * Calculate nutritional status based on WHO standards
     * This is a simplified version - you should use proper WHO z-score tables
     */
    private function calculateNutritionalStatus(Child $child, float $weight, float $height, string $measuredAt): string
    {
        // Calculate age in months at measurement date
        $birthDate = new \DateTime($child->birth_date);
        $measureDate = new \DateTime($measuredAt);
        $ageInMonths = $birthDate->diff($measureDate)->m + ($birthDate->diff($measureDate)->y * 12);

        // Calculate BMI
        $heightInMeters = $height / 100;
        $bmi = $weight / ($heightInMeters * $heightInMeters);

        // Simplified logic - replace with proper WHO z-score calculation
        // This is just a placeholder
        if ($ageInMonths < 24) {
            // For children under 2 years
            if ($weight < 8) return 'sangat_kurang';
            if ($weight < 10) return 'kurang';
            if ($weight > 15) return 'lebih';
            return 'normal';
        } else {
            // For children 2 years and above
            if ($bmi < 14) return 'sangat_kurus';
            if ($bmi < 16) return 'kurus';
            if ($bmi > 18) return 'gemuk';
            if ($bmi > 20) return 'lebih';
            
            // Check height for stunting
            if ($height < 75) return 'sangat_pendek';
            if ($height < 80) return 'pendek';
            
            return 'normal';
        }
    }
}
