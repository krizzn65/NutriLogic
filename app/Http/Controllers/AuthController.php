<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\PointsService;
use App\Services\LoginAttemptService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(
        private PointsService $pointsService,
        private LoginAttemptService $loginAttemptService
    ) {
    }
    /**
     * Register a new user.
     * 
     * Public endpoint that only allows registration with role 'ibu'.
     * Any other role sent by client will be overridden to 'ibu' for security.
     */
    public function register(Request $request): JsonResponse
    {
        // Trim all inputs to prevent leading/trailing spaces
        $request->merge([
            'name' => trim($request->name ?? ''),
            'email' => trim($request->email ?? ''),
            'phone' => trim($request->phone ?? ''),
        ]);

        // Custom validation to prevent user enumeration
        $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:191'],
            'phone' => ['nullable', 'string', 'max:20', 'regex:/^(08|62)\d{8,13}$/'],
            'address' => ['nullable', 'string', 'max:500'],
            'rt' => ['nullable', 'string', 'max:10'],
            'rw' => ['nullable', 'string', 'max:10'],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
            ],
            'role' => ['nullable', 'string', 'in:admin,kader,ibu'],
            'posyandu_id' => ['nullable', 'integer', 'exists:posyandus,id'],
        ], [
            'email.email' => 'Format email tidak valid.',
            'phone.regex' => 'Format nomor telepon tidak valid. Gunakan format 08xxxxxxxxxx atau 62xxxxxxxxxx.',
            'password.min' => 'Password minimal 8 karakter.',
            'password.regex' => 'Password harus mengandung minimal 1 huruf besar, 1 huruf kecil, dan 1 angka.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        // Check if email or phone already exists
        $emailExists = User::where('email', $request->email)->exists();
        $phoneExists = $request->phone ? User::where('phone', $request->phone)->exists() : false;

        if ($emailExists || $phoneExists) {
            // Generic error message to prevent enumeration
            // Log detailed reason server-side for admin investigation
            AdminActivityLogController::log(
                'registration_failed',
                "Registrasi gagal - Email/Phone sudah terdaftar: {$request->email} / {$request->phone}",
                'User',
                null,
                ['ip' => $request->ip(), 'user_agent' => $request->userAgent()]
            );

            // More specific error message for better UX
            if ($emailExists && $phoneExists) {
                $message = 'Email dan nomor telepon sudah terdaftar.';
            } elseif ($emailExists) {
                $message = 'Email sudah terdaftar. Gunakan email lain atau login dengan akun yang sudah ada.';
            } else {
                $message = 'Nomor telepon sudah terdaftar. Gunakan nomor lain atau login dengan akun yang sudah ada.';
            }

            return response()->json([
                'message' => $message,
            ], 422);
        }

        $validated = $request->all();

        // Force role to 'ibu' for public registration endpoint
        // Admin and kader roles should only be created via seeder or internal panel
        $validated['role'] = 'ibu';
        // Keep posyandu_id from request (user selects their posyandu during registration)

        // Password will be automatically hashed by model cast ('password' => 'hashed')
        // Do NOT manually Hash::make here to avoid double hashing!

        // Create user
        $user = User::create($validated);

        // Log activity
        AdminActivityLogController::log('create', "User baru registrasi: {$user->name}", 'User', $user->id);

        // Generate Sanctum token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Login user and return token.
     * Supports login with phone number or full name.
     */
    public function login(Request $request): JsonResponse
    {
        // Trim identifier to prevent login failures from spaces
        $request->merge([
            'identifier' => trim($request->identifier ?? ''),
        ]);

        $request->validate([
            'identifier' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $identifier = $request->identifier;
        $ipAddress = $request->ip();

        // Check if account is locked
        if ($this->loginAttemptService->isLocked($identifier, $ipAddress)) {
            $lockoutMinutes = $this->loginAttemptService->getLockoutTime($identifier, $ipAddress);
            
            return response()->json([
                'message' => "Akun terkunci karena terlalu banyak percobaan login gagal. Coba lagi dalam {$lockoutMinutes} menit.",
                'locked_until' => $lockoutMinutes,
            ], 429);
        }

        // Find user by email, phone OR name (case insensitive for name)
        $user = User::where('email', $identifier)
            ->orWhere('phone', $identifier)
            ->orWhere('name', $identifier)
            ->first();

        // Check password
        if (!$user || !Hash::check($request->password, $user->password)) {
            // Record failed attempt
            $this->loginAttemptService->recordFailedAttempt($identifier, $ipAddress, $request->userAgent());
            
            // Get remaining attempts
            $failedAttempts = $this->loginAttemptService->getFailedAttempts($identifier);
            $maxAttempts = $this->loginAttemptService->getMaxAttempts();
            $remainingAttempts = max(0, $maxAttempts - $failedAttempts);

            // Log failed login attempt
            if ($user) {
                AdminActivityLogController::log(
                    'login_failed', 
                    "Login gagal untuk user: {$user->name} (Attempt {$failedAttempts}/{$maxAttempts})",
                    'User', 
                    $user->id,
                    ['ip' => $ipAddress, 'user_agent' => $request->userAgent()]
                );
            }
            
            $message = 'Email/No. Telepon atau password salah.';
            if ($remainingAttempts > 0 && $remainingAttempts <= 2) {
                $message .= " Sisa percobaan: {$remainingAttempts}x.";
            }

            return response()->json([
                'message' => $message,
                'remaining_attempts' => $remainingAttempts,
            ], 401);
        }

        // Check if user is active
        if (!$user->is_active) {
            return response()->json([
                'message' => 'Akun Anda tidak aktif. Silakan hubungi admin.',
            ], 401);
        }

        // Record successful login
        $this->loginAttemptService->recordSuccessfulAttempt($identifier, $ipAddress, $request->userAgent());

        // Single Session Enforcement: Revoke all previous tokens
        $user->tokens()->delete();

        // Generate Sanctum token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Log successful login
        AdminActivityLogController::log('login', "User login: {$user->name} ({$user->role})", 'User', $user->id);

        // Add points and check badges for login (only for ibu role)
        if ($user->isIbu()) {
            $this->pointsService->checkBadgesAfterActivity($user, 'login');
        }

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 200);
    }

    /**
     * Logout user (revoke current token).
     * 
     * Requires authentication via Sanctum middleware.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Log logout
        AdminActivityLogController::log('logout', "User logout: {$user->name} ({$user->role})", 'User', $user->id);
        
        // Delete current access token
        $user->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ], 200);
    }

    /**
     * Get current authenticated user.
     * 
     * Requires authentication via Sanctum middleware.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load('posyandu');
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->address,
                'rt' => $user->rt,
                'rw' => $user->rw,
                'posyandu' => $user->posyandu ? [
                    'id' => $user->posyandu->id,
                    'name' => $user->posyandu->name,
                ] : null,
                'role' => $user->role,
                'profile_photo_url' => $user->profile_photo_path 
                    ? asset('storage/' . $user->profile_photo_path) 
                    : null,
            ],
        ], 200);
    }
}

