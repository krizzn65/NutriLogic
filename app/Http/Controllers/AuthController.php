<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\PointsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(
        private PointsService $pointsService
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
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:191', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['nullable', 'string', 'in:admin,kader,ibu'],
            'posyandu_id' => ['nullable', 'integer', 'exists:posyandus,id'],
        ]);

        // Force role to 'ibu' for public registration endpoint
        // Admin and kader roles should only be created via seeder or internal panel
        $validated['role'] = 'ibu';
        $validated['posyandu_id'] = null; // Ibu doesn't need posyandu_id

        // Hash password (will also be hashed by model cast, but explicit for clarity)
        $validated['password'] = Hash::make($validated['password']);

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
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        // Find user by email
        $user = User::where('email', $request->email)->first();

        // Check password
        if (!$user || !Hash::check($request->password, $user->password)) {
            // Log failed login attempt
            if ($user) {
                AdminActivityLogController::log('login', "Login gagal untuk user: {$user->name}", 'User', $user->id);
            }
            
            return response()->json([
                'message' => 'Email atau password salah.',
            ], 401);
        }

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
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'profile_photo_url' => $user->profile_photo_path 
                    ? asset('storage/' . $user->profile_photo_path) 
                    : null,
            ],
        ], 200);
    }
}

