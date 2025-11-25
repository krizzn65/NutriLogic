<?php

use App\Http\Controllers\AtRiskController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChildController;
use App\Http\Controllers\ImmunizationScheduleController;
use App\Http\Controllers\MealLogController;
use App\Http\Controllers\NutriAssistController;
use App\Http\Controllers\ParentConsultationController;
use App\Http\Controllers\ParentDashboardController;
use App\Http\Controllers\ParentHistoryController;
use App\Http\Controllers\ParentPointsController;
use App\Http\Controllers\ParentProfileController;
use App\Http\Controllers\ParentSettingsController;
use App\Http\Controllers\PosyanduController;
use App\Http\Controllers\WeighingLogController;
use Illuminate\Support\Facades\Route;

// Public authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public routes (no auth required)
Route::get('/posyandus', [PosyanduController::class, 'index']); // Public untuk registrasi

// Protected authentication routes (require Sanctum authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Children routes
    Route::prefix('children')->group(function () {
        Route::get('/', [ChildController::class, 'index']);
        Route::post('/', [ChildController::class, 'store']);
        Route::get('/{id}', [ChildController::class, 'show']);
        Route::put('/{id}', [ChildController::class, 'update']);
        Route::delete('/{id}', [ChildController::class, 'destroy']);
        Route::get('/{id}/growth-chart', [ChildController::class, 'growthChart']);
        Route::get('/{id}/nutritional-status', [ChildController::class, 'nutritionalStatus']);
        Route::get('/{id}/reminders', [ChildController::class, 'reminders']);
    });

    // Weighing logs routes
    Route::prefix('weighing-logs')->group(function () {
        Route::get('/', [WeighingLogController::class, 'index']);
        Route::post('/', [WeighingLogController::class, 'store']);
        Route::get('/child/{childId}', [WeighingLogController::class, 'index']);
        Route::get('/{id}', [WeighingLogController::class, 'show']);
        Route::put('/{id}', [WeighingLogController::class, 'update']);
        Route::delete('/{id}', [WeighingLogController::class, 'destroy']);
    });

    // Meal logs routes
    Route::prefix('meal-logs')->group(function () {
        Route::get('/', [MealLogController::class, 'index']);
        Route::post('/', [MealLogController::class, 'store']);
        Route::get('/child/{childId}', [MealLogController::class, 'index']);
        Route::get('/{id}', [MealLogController::class, 'show']);
        Route::put('/{id}', [MealLogController::class, 'update']);
        Route::delete('/{id}', [MealLogController::class, 'destroy']);
    });

    // Immunization schedules routes
    Route::prefix('immunization-schedules')->group(function () {
        Route::get('/', [ImmunizationScheduleController::class, 'index']);
        Route::post('/', [ImmunizationScheduleController::class, 'store']);
        Route::get('/child/{childId}', [ImmunizationScheduleController::class, 'index']);
        Route::get('/{id}', [ImmunizationScheduleController::class, 'show']);
        Route::put('/{id}', [ImmunizationScheduleController::class, 'update']);
        Route::delete('/{id}', [ImmunizationScheduleController::class, 'destroy']);
    });

    // Posyandu routes (admin/kader only - handled in controller)
    Route::prefix('posyandus')->group(function () {
        Route::get('/{id}', [PosyanduController::class, 'show']);
        Route::post('/', [PosyanduController::class, 'store']);
        Route::put('/{id}', [PosyanduController::class, 'update']);
        Route::delete('/{id}', [PosyanduController::class, 'destroy']);
    });

    // Early Warning System routes
    Route::prefix('children')->group(function () {
        Route::get('/at-risk', [AtRiskController::class, 'index']);
    });

    // Nutri-Assist routes
    Route::prefix('nutri-assist')->group(function () {
        Route::post('/recommend', [NutriAssistController::class, 'recommend']);
    });

    // Parent dashboard routes
    Route::prefix('parent')->group(function () {
        Route::get('/dashboard', [ParentDashboardController::class, 'dashboard']);
        Route::get('/children', [ParentDashboardController::class, 'children']);
        Route::get('/children/{id}', [ParentDashboardController::class, 'showChild']);
        Route::post('/children/{id}/nutri-assist', [ParentDashboardController::class, 'nutriAssist']);

        // Parent consultation routes
        Route::get('/consultations', [ParentConsultationController::class, 'index']);
        Route::post('/consultations', [ParentConsultationController::class, 'store']);
        Route::get('/consultations/{id}', [ParentConsultationController::class, 'show']);
        Route::post('/consultations/{id}/messages', [ParentConsultationController::class, 'sendMessage']);

        // Parent points & badges routes
        Route::get('/points', [ParentPointsController::class, 'index']);

        // Parent history routes
        Route::get('/history', [ParentHistoryController::class, 'index']);

        // Parent settings routes
        Route::get('/settings', [ParentSettingsController::class, 'index']);
        Route::put('/settings', [ParentSettingsController::class, 'update']);

        // Parent profile routes
        Route::put('/profile', [ParentProfileController::class, 'update']);
        Route::put('/profile/password', [ParentProfileController::class, 'updatePassword']);
    });

    // Kader/Admin routes (protected by kader middleware)
    Route::prefix('kader')->middleware('kader')->group(function () {
        // Test endpoint to verify middleware is working
        Route::get('/test', function () {
            return response()->json([
                'message' => 'Kader middleware is working!',
                'user' => auth()->user()->only(['id', 'name', 'role', 'posyandu_id']),
            ]);
        });

        // Dashboard
        Route::get('/dashboard', [App\Http\Controllers\KaderDashboardController::class, 'dashboard']);

        // Children Management
        Route::prefix('children')->group(function () {
            Route::get('/', [App\Http\Controllers\KaderChildController::class, 'index']);
            Route::post('/', [App\Http\Controllers\KaderChildController::class, 'store']);
            
            // Priority Children - must be before {id} routes
            Route::get('/priorities', [App\Http\Controllers\KaderPriorityController::class, 'index']);
            
            Route::get('/{id}', [App\Http\Controllers\KaderChildController::class, 'show']);
            Route::put('/{id}', [App\Http\Controllers\KaderChildController::class, 'update']);
            Route::delete('/{id}', [App\Http\Controllers\KaderChildController::class, 'destroy']);
            Route::get('/{id}/weighings', [App\Http\Controllers\KaderWeighingController::class, 'childHistory']);
        });

        // Weighing Management
        Route::prefix('weighings')->group(function () {
            Route::get('/today', [App\Http\Controllers\KaderWeighingController::class, 'todayList']);
            Route::post('/bulk', [App\Http\Controllers\KaderWeighingController::class, 'bulkStore']);
        });

        // Schedule Management
        Route::prefix('schedules')->group(function () {
            Route::get('/', [App\Http\Controllers\KaderScheduleController::class, 'index']);
            Route::post('/', [App\Http\Controllers\KaderScheduleController::class, 'store']);
            Route::put('/{id}', [App\Http\Controllers\KaderScheduleController::class, 'update']);
            Route::delete('/{id}', [App\Http\Controllers\KaderScheduleController::class, 'destroy']);
        });

        // Consultation Management
        Route::prefix('consultations')->group(function () {
            Route::get('/', [App\Http\Controllers\KaderConsultationController::class, 'index']);
            Route::get('/{id}', [App\Http\Controllers\KaderConsultationController::class, 'show']);
            Route::post('/{id}/messages', [App\Http\Controllers\KaderConsultationController::class, 'storeMessage']);
            Route::put('/{id}/close', [App\Http\Controllers\KaderConsultationController::class, 'close']);
        });

        // Report & Export
        Route::prefix('report')->group(function () {
            Route::get('/summary', [App\Http\Controllers\KaderReportController::class, 'summary']);
            Route::get('/export/children', [App\Http\Controllers\KaderReportController::class, 'exportChildren']);
            Route::get('/export/weighings', [App\Http\Controllers\KaderReportController::class, 'exportWeighings']);
        });

        // Broadcast Management
        Route::prefix('broadcast')->group(function () {
            Route::post('/', [App\Http\Controllers\KaderBroadcastController::class, 'store']);
            Route::get('/', [App\Http\Controllers\KaderBroadcastController::class, 'index']);
        });

        // Profile Management
        Route::prefix('profile')->group(function () {
            Route::get('/', [App\Http\Controllers\KaderProfileController::class, 'show']);
            Route::put('/', [App\Http\Controllers\KaderProfileController::class, 'update']);
            Route::put('/password', [App\Http\Controllers\KaderProfileController::class, 'updatePassword']);
        });

        // Actual kader endpoints will be added here in next menus
    });
});
