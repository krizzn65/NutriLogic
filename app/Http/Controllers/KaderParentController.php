<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class KaderParentController extends Controller
{
    /**
     * Get list of parents (ibu/orang_tua) in kader's posyandu
     * Lightweight endpoint for dropdowns - only returns id, name, phone
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            // Get all parents with role 'ibu' (orang tua)
            // Show all active parents to allow kader to assign them to their posyandu
            $query = User::where('role', 'ibu')
                ->where('is_active', true)
                ->select('id', 'name', 'phone', 'email', 'posyandu_id');

            // Prioritize parents from same posyandu, but show all
            if ($user->posyandu_id) {
                $query->orderByRaw("CASE WHEN posyandu_id = ? THEN 0 ELSE 1 END", [$user->posyandu_id]);
            }
            
            $query->orderBy('name', 'asc');

            $parents = $query->get();

            Log::info('Parents fetched', [
                'kader_id' => $user->id,
                'posyandu_id' => $user->posyandu_id,
                'count' => $parents->count(),
                'parent_ids' => $parents->pluck('id')->toArray()
            ]);

            return response()->json([
                'data' => $parents,
                'message' => 'Parents retrieved successfully',
                'count' => $parents->count()
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to fetch parents', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'data' => [],
                'message' => 'Failed to retrieve parents',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
