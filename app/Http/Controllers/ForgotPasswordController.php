<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\PasswordResetMail;

class ForgotPasswordController extends Controller
{
    /**
     * Send password reset token via email
     * Rate limited to prevent abuse
     */
    public function sendResetLink(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        // Find user by email
        $user = User::where('email', $request->email)->first();

        // Always return success to prevent email enumeration
        // But only send email if user exists
        if ($user) {
            // Delete old tokens for this email
            DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->delete();

            // Generate secure random 6-digit token
            $token = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            // Store token (expires in 1 hour)
            DB::table('password_reset_tokens')->insert([
                'email' => $request->email,
                'token' => Hash::make($token),
                'created_at' => now(),
            ]);

            // Send email with reset code
            try {
                Mail::to($user->email)->send(new PasswordResetMail($user, $token));
            } catch (\Exception $e) {
                // Log error but don't expose to user
                \Log::error('Failed to send password reset email: ' . $e->getMessage());
            }

            // Log activity
            AdminActivityLogController::log(
                'password_reset_request',
                "Permintaan reset password untuk: {$user->email}",
                'User',
                $user->id
            );
        }

        // Generic response to prevent email enumeration
        return response()->json([
            'message' => 'Jika email terdaftar, kode reset password telah dikirim.',
        ], 200);
    }

    /**
     * Reset password using token
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'token' => ['required', 'string', 'size:6', 'regex:/^[0-9]{6}$/'],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
            ],
        ], [
            'token.size' => 'Kode harus 6 digit.',
            'token.regex' => 'Kode harus berupa angka.',
            'password.min' => 'Password minimal 8 karakter.',
            'password.regex' => 'Password harus mengandung minimal 1 huruf besar, 1 huruf kecil, dan 1 angka.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        // Find reset token record
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        // Validate token exists and not expired (1 hour)
        if (!$resetRecord || now()->diffInMinutes($resetRecord->created_at) > 60) {
            return response()->json([
                'message' => 'Token reset password tidak valid atau sudah kadaluarsa.',
            ], 422);
        }

        // Verify token
        if (!Hash::check($request->token, $resetRecord->token)) {
            return response()->json([
                'message' => 'Kode reset password tidak valid.',
            ], 422);
        }

        // Find user
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User tidak ditemukan.',
            ], 404);
        }

        // Update password
        $user->password = Hash::make($request->password);
        $user->save();

        // Revoke all existing tokens (force re-login)
        $user->tokens()->delete();

        // Delete used reset token
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        // Log activity
        AdminActivityLogController::log(
            'password_reset_completed',
            "Password berhasil direset untuk: {$user->email}",
            'User',
            $user->id
        );

        // Create notification
        \App\Models\Notification::create([
            'user_id' => $user->id,
            'type' => 'success',
            'title' => 'Password Berhasil Direset',
            'message' => 'Password Anda telah berhasil diubah. Jika bukan Anda yang melakukan ini, segera hubungi admin.',
            'link' => null,
        ]);

        return response()->json([
            'message' => 'Password berhasil direset. Silakan login dengan password baru.',
        ], 200);
    }
}

