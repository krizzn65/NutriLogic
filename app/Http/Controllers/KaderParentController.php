<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KaderParentController extends Controller
{
    /**
     * Get list of parents (ibu) in kader's posyandu
     * Lightweight endpoint for dropdowns - only returns id, name, phone
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->posyandu_id) {
            return response()->json([
                'message' => 'Kader tidak memiliki posyandu yang terdaftar.',
            ], 400);
        }

        $parents = User::where('posyandu_id', $user->posyandu_id)
            ->where('role', 'ibu')
            ->select('id', 'name', 'phone', 'email')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'data' => $parents,
        ], 200);
    }
}
