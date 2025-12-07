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

        // Log activity
        AdminActivityLogController::log('create', "Admin membuat user baru: {$user->name} ({$user->role})", 'User', $user->id);

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

        // Prevent admin from editing own account
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'Anda tidak dapat mengedit akun Anda sendiri.',
            ], 403);
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

        // Log activity
        AdminActivityLogController::log('update', "Admin memperbarui user: {$user->name} ({$user->role})", 'User', $user->id);

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

        // Prevent admin from disabling own account
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'Anda tidak dapat menonaktifkan akun Anda sendiri.',
            ], 403);
        }

        $user->is_active = !($user->is_active ?? true);
        $user->save();

        // Log activity
        $status = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';
        AdminActivityLogController::log('update', "Admin {$status} user: {$user->name}", 'User', $user->id);

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

        // Prevent admin from resetting own password through this endpoint
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'Gunakan fitur ubah password di profil untuk mengubah password Anda sendiri.',
            ], 403);
        }

        // Store old password hash for audit trail
        $oldPasswordHash = $user->password;

        // Check if manual password is provided
        if ($request->has('password') && !empty($request->password)) {
            $request->validate([
                'password' => [
                    'required',
                    'string',
                    'min:8',
                    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
                ],
            ], [
                'password.min' => 'Password minimal 8 karakter.',
                'password.regex' => 'Password harus mengandung minimal 1 huruf besar, 1 huruf kecil, dan 1 angka.',
            ]);
            $newPassword = $request->password;
        } else {
            // Generate new random password with complexity requirements
            $newPassword = $this->generateSecurePassword();
        }

        $newPasswordHash = Hash::make($newPassword);
        $user->password = $newPasswordHash;
        $user->save();

        // Create notification for user about password reset
        \App\Models\Notification::create([
            'user_id' => $user->id,
            'type' => 'warning',
            'title' => 'Password Anda Telah Direset',
            'message' => 'Password akun Anda telah direset oleh Admin. Password baru: ' . $newPassword . '. Silakan login dengan password baru dan segera ubah password Anda.',
            'link' => null,
            'metadata' => [
                'reset_by' => auth()->id(),
                'reset_by_name' => auth()->user()->name,
                'reset_at' => now()->toDateTimeString(),
            ],
        ]);

        // Log activity with before/after snapshot
        AdminActivityLogController::log(
            'update',
            "Admin mereset password user: {$user->name} ({$user->email})",
            'User',
            $user->id,
            [
                'action' => 'reset_password',
                'before' => ['password_hash' => substr($oldPasswordHash, 0, 20) . '...'],
                'after' => ['password_hash' => substr($newPasswordHash, 0, 20) . '...'],
                'manual_password' => $request->has('password'),
            ]
        );

        return response()->json([
            'password' => $newPassword,
            'message' => 'Password berhasil direset.',
        ], 200);
    }

    /**
     * Generate secure random password with complexity requirements
     */
    private function generateSecurePassword(): string
    {
        $uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $lowercase = 'abcdefghijklmnopqrstuvwxyz';
        $numbers = '0123456789';
        $special = '!@#$%';

        // Ensure at least one of each type
        $password = $uppercase[rand(0, strlen($uppercase) - 1)];
        $password .= $lowercase[rand(0, strlen($lowercase) - 1)];
        $password .= $numbers[rand(0, strlen($numbers) - 1)];

        // Fill remaining 5 characters with random mix
        $allChars = $uppercase . $lowercase . $numbers . $special;
        for ($i = 0; $i < 5; $i++) {
            $password .= $allChars[rand(0, strlen($allChars) - 1)];
        }

        // Shuffle the password
        return str_shuffle($password);
    }
}
