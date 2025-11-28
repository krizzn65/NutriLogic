<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Posyandu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    /**
     * Get list of users with filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with('posyandu');

        // Filter by role
        if ($request->has('role') && in_array($request->role, ['kader', 'ibu', 'admin'])) {
            $query->where('role', $request->role);
        }

        // Filter by posyandu (for kader and ibu)
        if ($request->has('posyandu_id') && $request->posyandu_id) {
            $query->where('posyandu_id', $request->posyandu_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $isActive = $request->status === 'active';
            $query->where('is_active', $isActive);
        }

        $users = $query->orderBy('created_at', 'desc')->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'is_active' => $user->is_active ?? true,
                'posyandu' => $user->posyandu ? [
                    'id' => $user->posyandu->id,
                    'name' => $user->posyandu->name,
                ] : null,
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return response()->json([
            'data' => $users,
        ], 200);
    }

    /**
     * Create new user (kader or admin)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:20'],
            'role' => ['required', Rule::in(['kader', 'admin'])],
            'posyandu_id' => ['nullable', 'exists:posyandus,id'],
        ]);

        // Validate posyandu_id for kader
        if ($validated['role'] === 'kader' && empty($validated['posyandu_id'])) {
            return response()->json([
                'message' => 'Posyandu harus dipilih untuk role kader.',
            ], 422);
        }

        // Generate random password
        $password = Str::random(8);
        $validated['password'] = Hash::make($password);

        $user = User::create($validated);

        return response()->json([
            'data' => $user,
            'password' => $password, // Return password for first-time setup
            'message' => 'User berhasil ditambahkan.',
        ], 201);
    }

    /**
     * Update user data
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'User tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'phone' => ['required', 'string', 'max:20'],
            'role' => ['required', Rule::in(['kader', 'ibu', 'admin'])],
            'posyandu_id' => ['nullable', 'exists:posyandus,id'],
        ]);

        // Validate posyandu_id for kader
        if ($validated['role'] === 'kader' && empty($validated['posyandu_id'])) {
            return response()->json([
                'message' => 'Posyandu harus dipilih untuk role kader.',
            ], 422);
        }

        $user->update($validated);

        return response()->json([
            'data' => $user,
            'message' => 'User berhasil diperbarui.',
        ], 200);
    }

    /**
     * Toggle user active status
     */
    public function toggleActive(Request $request, $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'User tidak ditemukan.',
            ], 404);
        }

        $user->is_active = !($user->is_active ?? true);
        $user->save();

        return response()->json([
            'data' => $user,
            'message' => $user->is_active 
                ? 'User berhasil diaktifkan.' 
                : 'User berhasil dinonaktifkan.',
        ], 200);
    }

    /**
     * Reset user password
     */
    public function resetPassword(Request $request, $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'User tidak ditemukan.',
            ], 404);
        }

        // Generate new random password
        $newPassword = Str::random(8);
        $user->password = Hash::make($newPassword);
        $user->save();

        return response()->json([
            'password' => $newPassword,
            'message' => 'Password berhasil direset.',
        ], 200);
    }
}
