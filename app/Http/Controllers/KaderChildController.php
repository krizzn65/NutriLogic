<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class KaderChildController extends Controller
{
    /**
     * Get list of children in kader's posyandu
     * Supports filtering and search
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->posyandu_id) {
            return response()->json([
                'message' => 'Kader tidak memiliki posyandu yang terdaftar.',
            ], 400);
        }

        $query = Child::with(['parent', 'posyandu'])
            ->where('posyandu_id', $user->posyandu_id);

        // Search by child name or parent name
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhereHas('parent', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Filter by nutritional status
        if ($request->has('status') && $request->status) {
            $query->whereHas('weighingLogs', function ($q) use ($request) {
                $q->where('nutritional_status', $request->status)
                    ->whereRaw('id = (SELECT id FROM weighing_logs wl2 WHERE wl2.child_id = children.id ORDER BY wl2.measured_at DESC LIMIT 1)');
            });
        }

        // Validate pagination parameter
        $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $perPage = $request->input('per_page', 20);

        $children = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Add latest nutritional status to each child
        $children->each(function ($child) {
            $latestWeighing = $child->weighingLogs()
                ->orderBy('measured_at', 'desc')
                ->first();

            $child->latest_nutritional_status = [
                'status' => $latestWeighing->nutritional_status ?? 'tidak_diketahui',
                'measured_at' => $latestWeighing->measured_at ?? null,
                'weight_kg' => $latestWeighing->weight_kg ?? null,
                'height_cm' => $latestWeighing->height_cm ?? null,
            ];
        });

        return response()->json([
            'data' => $children->items(),
            'meta' => [
                'current_page' => $children->currentPage(),
                'per_page' => $children->perPage(),
                'total' => $children->total(),
                'last_page' => $children->lastPage(),
            ],
        ], 200);
    }

    /**
     * Get single child detail
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        
        $child = Child::with(['parent', 'posyandu', 'weighingLogs', 'mealLogs', 'pmtLogs', 'immunizationSchedules'])
            ->findOrFail($id);

        // Authorization: child must be in kader's posyandu
        if ($user->posyandu_id && $child->posyandu_id !== $user->posyandu_id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        return response()->json([
            'data' => $child,
        ], 200);
    }

    /**
     * Create new child
     * Can create parent user if not exists
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
            'parent_id' => ['nullable', 'integer', 'exists:users,id'],
            'parent_name' => ['required_without:parent_id', 'string', 'max:100'],
            'parent_email' => ['nullable', 'email', 'max:191', 'unique:users,email'],
            'parent_phone' => ['nullable', 'string', 'max:20'],
            'full_name' => ['required', 'string', 'max:150'],
            'nik' => ['nullable', 'string', 'max:32', 'unique:children,nik'],
            'birth_date' => ['required', 'date'],
            'gender' => ['required', 'string', 'in:L,P'],
            'birth_weight_kg' => ['nullable', 'numeric', 'min:0', 'max:10'],
            'birth_height_cm' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'notes' => ['nullable', 'string'],
        ]);

        // Handle parent creation or use existing
        if (!isset($validated['parent_id'])) {
            // Create new parent user
            $parent = User::create([
                'name' => $validated['parent_name'],
                'email' => $validated['parent_email'] ?? null,
                'phone' => $validated['parent_phone'] ?? null,
                'password' => Hash::make('password123'), // Default password
                'role' => 'ibu',
                'posyandu_id' => $user->posyandu_id,
            ]);
            $validated['parent_id'] = $parent->id;
        }

        // Create child
        $child = Child::create([
            'parent_id' => $validated['parent_id'],
            'posyandu_id' => $user->posyandu_id,
            'full_name' => $validated['full_name'],
            'nik' => $validated['nik'] ?? null,
            'birth_date' => $validated['birth_date'],
            'gender' => $validated['gender'],
            'birth_weight_kg' => $validated['birth_weight_kg'] ?? null,
            'birth_height_cm' => $validated['birth_height_cm'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'data' => $child->load(['parent', 'posyandu']),
            'message' => 'Data anak berhasil ditambahkan.',
        ], 201);
    }

    /**
     * Update child data
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $child = Child::findOrFail($id);

        // Authorization
        if ($user->posyandu_id && $child->posyandu_id !== $user->posyandu_id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        $validated = $request->validate([
            'full_name' => ['sometimes', 'string', 'max:150'],
            'nik' => ['nullable', 'string', 'max:32', 'unique:children,nik,' . $id],
            'birth_date' => ['sometimes', 'date'],
            'gender' => ['sometimes', 'string', 'in:L,P'],
            'birth_weight_kg' => ['nullable', 'numeric', 'min:0', 'max:10'],
            'birth_height_cm' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $child->update($validated);

        return response()->json([
            'data' => $child->load(['parent', 'posyandu']),
            'message' => 'Data anak berhasil diperbarui.',
        ], 200);
    }

    /**
     * Soft delete child (set is_active = false)
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $child = Child::findOrFail($id);

        // Authorization
        if ($user->posyandu_id && $child->posyandu_id !== $user->posyandu_id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        $child->update(['is_active' => false]);

        return response()->json([
            'message' => 'Data anak berhasil dinonaktifkan.',
        ], 200);
    }
}
