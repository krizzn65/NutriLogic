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
            'weighings.*.measured_at' => ['required', 'date', 'before_or_equal:today'],
            'weighings.*.weight_kg' => ['required', 'numeric', 'min:1', 'max:30'],
            'weighings.*.height_cm' => ['required', 'numeric', 'min:40', 'max:130'],
            'weighings.*.muac_cm' => ['nullable', 'numeric', 'min:8', 'max:25'],
            'weighings.*.head_circumference_cm' => ['nullable', 'numeric', 'min:30', 'max:60'],
            'weighings.*.notes' => ['nullable', 'string', 'max:500'],
        ], [
            'weighings.*.measured_at.before_or_equal' => 'Tanggal penimbangan tidak boleh di masa depan.',
            'weighings.*.weight_kg.min' => 'Berat badan minimal 1 kg.',
            'weighings.*.weight_kg.max' => 'Berat badan maksimal 30 kg (untuk anak 0-5 tahun).',
            'weighings.*.height_cm.min' => 'Tinggi badan minimal 40 cm.',
            'weighings.*.height_cm.max' => 'Tinggi badan maksimal 130 cm (untuk anak 0-5 tahun).',
            'weighings.*.muac_cm.min' => 'Lingkar lengan minimal 8 cm.',
            'weighings.*.muac_cm.max' => 'Lingkar lengan maksimal 25 cm.',
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
        $errors = [];

        DB::beginTransaction();
        try {
            foreach ($validated['weighings'] as $index => $weighingData) {
                $child = Child::find($weighingData['child_id']);
                
                // Validate measured_at is not before birth_date
                if ($child && $weighingData['measured_at'] < $child->birth_date) {
                    $errors[] = "Anak '{$child->full_name}': Tanggal penimbangan tidak boleh sebelum tanggal lahir.";
                    continue;
                }

                // Check for duplicate weighing on same date
                $existingWeighing = WeighingLog::where('child_id', $weighingData['child_id'])
                    ->whereDate('measured_at', $weighingData['measured_at'])
                    ->first();

                if ($existingWeighing) {
                    $errors[] = "Anak '{$child->full_name}': Sudah ada data penimbangan pada tanggal " . date('d/m/Y', strtotime($weighingData['measured_at'])) . ". Gunakan fitur edit jika ingin memperbarui.";
                    continue;
                }

                // Additional age-based validation
                $birthDate = new \Carbon\Carbon($child->birth_date);
                $measuredDate = new \Carbon\Carbon($weighingData['measured_at']);
                $ageInMonths = $birthDate->diffInMonths($measuredDate);

                // Validate weight based on age
                if ($ageInMonths < 12 && $weighingData['weight_kg'] > 15) {
                    $errors[] = "Anak '{$child->full_name}': Berat {$weighingData['weight_kg']} kg terlalu tinggi untuk usia {$ageInMonths} bulan. Periksa kembali.";
                    continue;
                }

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

            // If there are errors and no successful saves, rollback
            if (count($errors) > 0 && count($savedWeighings) === 0) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Tidak ada data yang berhasil disimpan.',
                    'errors' => $errors,
                ], 422);
            }

            DB::commit();

            // Log activity for each saved weighing
            foreach ($savedWeighings as $weighing) {
                $child = Child::find($weighing->child_id);
                AdminActivityLogController::log(
                    'create',
                    "Kader {$user->name} menimbang anak: {$child->full_name} (BB: {$weighing->weight_kg}kg, TB: {$weighing->height_cm}cm, Status: {$weighing->nutritional_status})",
                    'WeighingLog',
                    $weighing->id
                );
            }

            $message = count($savedWeighings) . ' data penimbangan berhasil disimpan.';
            if (count($errors) > 0) {
                $message .= ' ' . count($errors) . ' data dilewati karena error.';
            }

            return response()->json([
                'data' => $savedWeighings,
                'message' => $message,
                'warnings' => count($errors) > 0 ? $errors : null,
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
