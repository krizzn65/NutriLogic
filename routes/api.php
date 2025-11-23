<?php

use App\Http\Controllers\AtRiskController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChildController;
use App\Http\Controllers\ImmunizationScheduleController;
use App\Http\Controllers\MealLogController;
use App\Http\Controllers\NutriAssistController;
use App\Http\Controllers\ParentConsultationController;
use App\Http\Controllers\ParentDashboardController;
use App\Http\Controllers\ParentPointsController;
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
    });
});
