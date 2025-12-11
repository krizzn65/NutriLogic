<?php

namespace App\Http\Controllers;

use App\Models\ImmunizationRecord;
use App\Models\Child;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class KaderImmunizationController extends Controller
{
    /**
     * Get all children for immunization
     */
    public function getChildren()
    {
        $user = Auth::user();
        
        $children = Child::where('posyandu_id', $user->posyandu_id)
            ->where('is_active', true)
            ->with(['latestImmunization' => function($query) {
                $query->orderBy('immunization_date', 'desc');
            }])
            ->orderBy('full_name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $children
        ]);
    }

    /**
     * Store bulk immunization records
     */
    public function storeBulk(Request $request)
    {
        $validated = $request->validate([
            'records' => ['required', 'array', 'min:1'],
            'records.*.child_id' => ['required', 'exists:children,id'],
            'records.*.vaccine_type' => ['required', 'in:bcg,hepatitis_b_0,hepatitis_b_1,hepatitis_b_2,hepatitis_b_3,polio_0,polio_1,polio_2,polio_3,polio_4,dpt_hib_hep_b_1,dpt_hib_hep_b_2,dpt_hib_hep_b_3,ipv_1,ipv_2,campak_rubella_1,campak_rubella_2,other'],
            'records.*.immunization_date' => ['required', 'date'],
            'records.*.batch_number' => ['nullable', 'string', 'max:100'],
            'records.*.notes' => ['nullable', 'string', 'max:500'],
        ]);

        $user = Auth::user();
        $records = [];
        $warnings = [];

        DB::beginTransaction();
        try {
            foreach ($validated['records'] as $data) {
                // Verify child belongs to kader's posyandu
                $child = Child::findOrFail($data['child_id']);
                if ($child->posyandu_id !== $user->posyandu_id) {
                    throw new \Exception('Unauthorized access to child data');
                }

                // Check if immunization already given on this date
                $existing = ImmunizationRecord::where('child_id', $data['child_id'])
                    ->where('immunization_date', $data['immunization_date'])
                    ->where('vaccine_type', $data['vaccine_type'])
                    ->first();

                if ($existing) {
                    $warnings[] = "Imunisasi {$data['vaccine_type']} untuk {$child->full_name} sudah tercatat pada tanggal ini";
                    continue;
                }

                $record = ImmunizationRecord::create([
                    'child_id' => $data['child_id'],
                    'posyandu_id' => $user->posyandu_id,
                    'vaccine_type' => $data['vaccine_type'],
                    'immunization_date' => $data['immunization_date'],
                    'batch_number' => $data['batch_number'] ?? null,
                    'notes' => $data['notes'] ?? null,
                ]);

                $records[] = $record->load('child');
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => count($records) . ' data imunisasi berhasil disimpan',
                'data' => $records,
                'warnings' => $warnings
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan data imunisasi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get immunization history
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $query = ImmunizationRecord::where('posyandu_id', $user->posyandu_id)
            ->with('child');

        // Filter by date range if provided
        if ($request->has('start_date')) {
            $query->where('immunization_date', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('immunization_date', '<=', $request->end_date);
        }

        // Filter by vaccine type if provided
        if ($request->has('vaccine_type')) {
            $query->where('vaccine_type', $request->vaccine_type);
        }

        $records = $query->orderBy('immunization_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $records
        ]);
    }

    /**
     * Delete an immunization record
     */
    public function destroy($id)
    {
        $user = Auth::user();
        
        $record = ImmunizationRecord::findOrFail($id);

        // Verify it belongs to kader's posyandu
        if ($record->posyandu_id !== $user->posyandu_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $record->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data imunisasi berhasil dihapus'
        ]);
    }
}
