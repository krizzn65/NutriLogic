<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class KaderProfileController extends Controller
{
    /**
     * Get kader profile
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        $user->load('posyandu');

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'posyandu_id' => $user->posyandu_id,
                'posyandu' => $user->posyandu ? [
                    'id' => $user->posyandu->id,
                    'name' => $user->posyandu->name,
                ] : null,
                'profile_photo_url' => $user->profile_photo_path 
                    ? asset('storage/' . $user->profile_photo_path) 
                    : null,
            ],
        ], 200);
    }

    /**
     * Update kader profile
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone' => ['nullable', 'string', 'max:20'],
            'profile_photo' => ['nullable', 'image', 'max:2048'], // Max 2MB
        ]);

        // Update basic info
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->phone = $validated['phone'] ?? null;

        // Handle profile photo upload
        if ($request->hasFile('profile_photo')) {
            // Delete old photo if exists
            if ($user->profile_photo_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->profile_photo_path);
            }

            $path = $request->file('profile_photo')->store('profile-photos', 'public');
            $user->profile_photo_path = $path;
        }

        $user->save();

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'profile_photo_url' => $user->profile_photo_path 
                    ? asset('storage/' . $user->profile_photo_path) 
                    : null,
            ],
            'message' => 'Profil berhasil diperbarui.',
        ], 200);
    }

    /**
     * Update password
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'confirmed', Password::min(8)],
        ]);

        // Verify current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Password saat ini tidak sesuai.',
                'errors' => [
                    'current_password' => ['Password saat ini tidak sesuai.']
                ]
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return response()->json([
            'message' => 'Password berhasil diubah.',
        ], 200);
    }
}
