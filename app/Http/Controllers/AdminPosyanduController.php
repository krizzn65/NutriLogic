<?php

namespace App\Http\Controllers;

use App\Models\Posyandu;
use App\Models\Child;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPosyanduController extends Controller
{
    /**
     * Get list of all posyandu
     */
    public function index(Request $request): JsonResponse
    {
        $query = Posyandu::query();

        // Filter by status if provided
        if ($request->has('status')) {
            $isActive = $request->status === 'active';
            $query->where('is_active', $isActive);
        }

        $posyandus = $query->get()->map(function ($posyandu) {
            return [
                'id' => $posyandu->id,
                'name' => $posyandu->name,
                'village' => $posyandu->village,
                'city' => $posyandu->city,
                'address' => $posyandu->address,
                'rt_rw' => $posyandu->rt_rw,
                'latitude' => $posyandu->latitude,
                'longitude' => $posyandu->longitude,
                'is_active' => $posyandu->is_active,
                'kader_count' => User::where('posyandu_id', $posyandu->id)->where('role', 'kader')->count(),
                'children_count' => Child::where('posyandu_id', $posyandu->id)->count(),
            ];
        });

        return response()->json([
            'data' => $posyandus,
        ], 200);
    }

    /**
     * Create new posyandu
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'village' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['required', 'string', 'max:255'],
            'rt_rw' => ['nullable', 'string', 'max:50'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        $posyandu = Posyandu::create($validated);

        return response()->json([
            'data' => $posyandu,
            'message' => 'Posyandu berhasil ditambahkan.',
        ], 201);
    }

    /**
     * Update posyandu data
     */
    public function update(Request $request, $id): JsonResponse
    {
        $posyandu = Posyandu::find($id);

        if (!$posyandu) {
            return response()->json([
                'message' => 'Posyandu tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'village' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['required', 'string', 'max:255'],
            'rt_rw' => ['nullable', 'string', 'max:50'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        $posyandu->update($validated);

        return response()->json([
            'data' => $posyandu,
            'message' => 'Posyandu berhasil diperbarui.',
        ], 200);
    }

    /**
     * Toggle posyandu active status
     */
    public function toggleActive(Request $request, $id): JsonResponse
    {
        $posyandu = Posyandu::find($id);

        if (!$posyandu) {
            return response()->json([
                'message' => 'Posyandu tidak ditemukan.',
            ], 404);
        }

        $posyandu->is_active = !$posyandu->is_active;
        $posyandu->save();

        return response()->json([
            'data' => $posyandu,
            'message' => $posyandu->is_active 
                ? 'Posyandu berhasil diaktifkan.' 
                : 'Posyandu berhasil dinonaktifkan.',
        ], 200);
    }
}
