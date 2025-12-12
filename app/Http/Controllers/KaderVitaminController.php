<?php

namespace App\Http\Controllers;

use App\Models\VitaminDistribution;
use App\Models\Child;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class KaderVitaminController extends Controller
{
    /**
     * Get all children for vitamin distribution
     */
    public function getChildren()
    {
        $user = Auth::user();
        $today = date('Y-m-d');
        
        $children = Child::where('posyandu_id', $user->posyandu_id)
            ->where('is_active', true)
            ->with(['latestVitamin' => function($query) {
                $query->orderBy('distribution_date', 'desc');
            }])
            ->orderBy('full_name')
            ->get();

        // Add today's vitamin data for each child
        $children->each(function ($child) use ($today) {
            $todayVitamin = VitaminDistribution::where('child_id', $child->id)
                ->where('distribution_date', $today)
                ->first();

            $child->today_vitamin = $todayVitamin ? [
                'id' => $todayVitamin->id,
                'vitamin_type' => $todayVitamin->vitamin_type,
                'distribution_date' => $todayVitamin->distribution_date,
                'dosage' => $todayVitamin->dosage,
                'notes' => $todayVitamin->notes,
            ] : null;
        });

        return response()->json([
            'success' => true,
            'data' => $children
        ]);
    }

    /**
     * Store bulk vitamin distributions
     */
    public function storeBulk(Request $request)
    {
        $validated = $request->validate([
            'distributions' => ['required', 'array', 'min:1'],
            'distributions.*.child_id' => ['required', 'exists:children,id'],
            'distributions.*.vitamin_type' => ['required', 'in:vitamin_a_blue,vitamin_a_red,other'],
            'distributions.*.distribution_date' => ['required', 'date'],
            'distributions.*.dosage' => ['nullable', 'string', 'max:50'],
            'distributions.*.notes' => ['nullable', 'string', 'max:500'],
        ]);

        $user = Auth::user();
        $distributions = [];
        $warnings = [];

        DB::beginTransaction();
        try {
            foreach ($validated['distributions'] as $data) {
                // Verify child belongs to kader's posyandu
                $child = Child::findOrFail($data['child_id']);
                if ($child->posyandu_id !== $user->posyandu_id) {
                    throw new \Exception('Unauthorized access to child data');
                }

                // Check if vitamin already given on this date
                $existing = VitaminDistribution::where('child_id', $data['child_id'])
                    ->where('distribution_date', $data['distribution_date'])
                    ->where('vitamin_type', $data['vitamin_type'])
                    ->first();

                if ($existing) {
                    $warnings[] = "Vitamin {$data['vitamin_type']} untuk {$child->full_name} sudah tercatat pada tanggal ini";
                    continue;
                }

                $distribution = VitaminDistribution::create([
                    'child_id' => $data['child_id'],
                    'posyandu_id' => $user->posyandu_id,
                    'vitamin_type' => $data['vitamin_type'],
                    'distribution_date' => $data['distribution_date'],
                    'dosage' => $data['dosage'] ?? null,
                    'notes' => $data['notes'] ?? null,
                ]);

                $distributions[] = $distribution->load('child');
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => count($distributions) . ' data vitamin berhasil disimpan',
                'data' => $distributions,
                'warnings' => $warnings
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan data vitamin: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a vitamin distribution record
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();

        $distribution = VitaminDistribution::findOrFail($id);

        if ($distribution->posyandu_id !== $user->posyandu_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'vitamin_type' => ['required', 'in:vitamin_a_blue,vitamin_a_red,other'],
            'dosage' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $distribution->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data vitamin berhasil diperbarui',
            'data' => $distribution->fresh()
        ]);
    }

    /**
     * Get vitamin distribution history
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $query = VitaminDistribution::where('posyandu_id', $user->posyandu_id)
            ->with('child');

        // Filter by date range if provided
        if ($request->has('start_date')) {
            $query->where('distribution_date', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('distribution_date', '<=', $request->end_date);
        }

        // Filter by vitamin type if provided
        if ($request->has('vitamin_type')) {
            $query->where('vitamin_type', $request->vitamin_type);
        }

        $distributions = $query->orderBy('distribution_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $distributions
        ]);
    }

    /**
     * Delete a vitamin distribution record
     */
    public function destroy($id)
    {
        $user = Auth::user();
        
        $distribution = VitaminDistribution::findOrFail($id);

        // Verify it belongs to kader's posyandu
        if ($distribution->posyandu_id !== $user->posyandu_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $distribution->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data vitamin berhasil dihapus'
        ]);
    }
}
