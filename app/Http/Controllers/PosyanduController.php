<?php

namespace App\Http\Controllers;

use App\Models\Posyandu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PosyanduController extends Controller
{
    /**
     * Get list of posyandus
     * Admin/Kader: can see all or their own posyandu
     * Ibu/Guest: can see active posyandus (for registration)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // If no user (public access for registration), return only active posyandus with minimal data
        if (!$user) {
            $posyandus = Posyandu::where('is_active', true)
                ->select('id', 'name', 'village', 'address')
                ->orderBy('name', 'asc')
                ->get();

            return response()->json([
                'data' => $posyandus,
            ], 200);
        }

        $query = Posyandu::withCount(['children', 'users']);

        // Kader/Admin can filter by their posyandu
        if (($user->isKader() || $user->isAdmin()) && $user->posyandu_id) {
            $query->where('id', $user->posyandu_id);
        }

        $posyandus = $query->orderBy('name', 'asc')->get();

        return response()->json([
            'data' => $posyandus,
        ], 200);
    }

    /**
     * Get single posyandu
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        // Base query
        $query = Posyandu::query();

        // If user is Admin or Kader, include children and users details
        if ($user->isAdmin() || $user->isKader()) {
            $query->with(['children', 'users'])
                  ->withCount(['children', 'users']);
        } 
        // If user is Ibu, only return basic Posyandu info (no relationships)
        
        $posyandu = $query->findOrFail($id);

        return response()->json([
            'data' => $posyandu,
        ], 200);
    }

    /**
     * Create new posyandu (Admin only)
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'message' => 'Only admin can create posyandu.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'village' => ['nullable', 'string', 'max:150'],
            'address' => ['nullable', 'string'],
            'rt_rw' => ['nullable', 'string', 'max:20'],
            'city' => ['nullable', 'string', 'max:100'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        $posyandu = Posyandu::create($validated);

        return response()->json([
            'data' => $posyandu,
            'message' => 'Posyandu created successfully.',
        ], 201);
    }

    /**
     * Update posyandu (Admin/Kader of that posyandu)
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $posyandu = Posyandu::findOrFail($id);

        // Authorization: Admin can update any, Kader can update their own
        if (!$user->isAdmin() && (!$user->isKader() || $user->posyandu_id !== $posyandu->id)) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:150'],
            'village' => ['nullable', 'string', 'max:150'],
            'address' => ['nullable', 'string'],
            'rt_rw' => ['nullable', 'string', 'max:20'],
            'city' => ['nullable', 'string', 'max:100'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        $posyandu->update($validated);

        return response()->json([
            'data' => $posyandu,
            'message' => 'Posyandu updated successfully.',
        ], 200);
    }

    /**
     * Delete posyandu (Admin only)
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'message' => 'Only admin can delete posyandu.',
            ], 403);
        }

        $posyandu = Posyandu::findOrFail($id);
        $posyandu->delete();

        return response()->json([
            'message' => 'Posyandu deleted successfully.',
        ], 200);
    }
}

