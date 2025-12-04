<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Services\NutritionService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParentDashboardController extends Controller
{
    protected NutritionService $nutritionService;

    public function __construct(NutritionService $nutritionService)
    {
        $this->nutritionService = $nutritionService;
    }
    /**
     * Get dashboard data for parent (ibu)
     *
     * Returns summary of children, nutritional status, and upcoming schedules
     */
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();

        // Authorization: only for ibu role
        if (!$user->isIbu()) {
            return response()->json([
                'message' => 'Unauthorized. This endpoint is only for parents.',
            ], 403);
        }

        // Get all children of this parent
        $children = Child::where('parent_id', $user->id)
            ->where('is_active', true)
            ->with(['weighingLogs' => function ($query) {
                $query->orderBy('measured_at', 'desc')->limit(1);
            }])
            ->get();

        $now = Carbon::now();
        $atRiskStatuses = ['pendek', 'sangat_pendek', 'kurang', 'sangat_kurang', 'kurus', 'sangat_kurus'];

        $childrenData = [];
        $atRiskCount = 0;

        foreach ($children as $child) {
            $latestWeighing = $child->weighingLogs->first();

            // Calculate age in days (age_in_months comes from model accessor)
            $ageInDays = $child->birth_date->diffInDays($now);

            // Determine nutritional status
            $nutritionalStatus = [
                'status' => $latestWeighing ? $latestWeighing->nutritional_status : 'tidak_diketahui',
                'zscore_hfa' => $latestWeighing ? $latestWeighing->zscore_hfa : null,
                'zscore_wfa' => $latestWeighing ? $latestWeighing->zscore_wfa : null,
                'zscore_wfh' => $latestWeighing ? $latestWeighing->zscore_wfh : null,
                'measured_at' => $latestWeighing ? $latestWeighing->measured_at->format('Y-m-d') : null,
                'is_at_risk' => false,
            ];

            // Check if at risk
            if ($latestWeighing && in_array($latestWeighing->nutritional_status, $atRiskStatuses)) {
                $nutritionalStatus['is_at_risk'] = true;
                $atRiskCount++;
            }

            $childrenData[] = [
                'id' => $child->id,
                'full_name' => $child->full_name,
                'age_in_months' => $child->age_in_months, // Use model accessor
                'age_in_days' => $ageInDays,
                'gender' => $child->gender,
                'weighing_logs' => $latestWeighing ? [[
                    'id' => $latestWeighing->id,
                    'weight_kg' => $latestWeighing->weight_kg,
                    'height_cm' => $latestWeighing->height_cm,
                    'muac_cm' => $latestWeighing->muac_cm,
                    'head_circumference_cm' => $latestWeighing->head_circumference_cm,
                    'measured_at' => $latestWeighing->measured_at->format('Y-m-d'),
                    'nutritional_status' => $latestWeighing->nutritional_status,
                ]] : [],
                'latest_nutritional_status' => $nutritionalStatus,
            ];
        }

        // Get upcoming schedules (immunization/vitamin) for all children
        $upcomingSchedules = [];
        $childIds = $children->pluck('id');

        if ($childIds->isNotEmpty()) {
            $schedules = \App\Models\ImmunizationSchedule::whereIn('child_id', $childIds)
                ->where('scheduled_for', '>=', $now)
                ->whereNull('completed_at')
                ->with('child')
                ->orderBy('scheduled_for', 'asc')
                ->limit(3)
                ->get();

            foreach ($schedules as $schedule) {
                $daysUntil = $now->diffInDays($schedule->scheduled_for, false);

                $upcomingSchedules[] = [
                    'id' => $schedule->id,
                    'child_id' => $schedule->child_id,
                    'child_name' => $schedule->child->full_name,
                    'title' => $schedule->title,
                    'type' => $schedule->type,
                    'scheduled_for' => $schedule->scheduled_for->format('Y-m-d'),
                    'days_until' => $daysUntil,
                    'is_urgent' => $daysUntil <= 7,
                ];
            }
        }

        return response()->json([
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'profile_photo_url' => $user->profile_photo_path
                        ? asset('storage/' . $user->profile_photo_path)
                        : null,
                ],
                'summary' => [
                    'total_children' => $children->count(),
                    'at_risk_count' => $atRiskCount,
                    'schedule_status' => $this->calculateScheduleStatus($children->pluck('id')),
                ],
                'children' => $childrenData,
                'upcoming_schedules' => $upcomingSchedules,
            ],
        ], 200);
    }

    /**
     * Get all immunization schedules for calendar
     *
     * Returns all upcoming and past schedules for the user's children
     */
    public function getCalendarSchedules(Request $request): JsonResponse
    {
        $user = $request->user();

        // Authorization: only for ibu role
        if (!$user->isIbu()) {
            return response()->json([
                'message' => 'Unauthorized. This endpoint is only for parents.',
            ], 403);
        }

        // Get all children IDs of this parent
        $childIds = Child::where('parent_id', $user->id)
            ->where('is_active', true)
            ->pluck('id');

        // Get ALL schedules (not limited)
        $schedules = \App\Models\ImmunizationSchedule::whereIn('child_id', $childIds)
            ->whereNull('completed_at')
            ->with('child')
            ->orderBy('scheduled_for', 'asc')
            ->get();

        $schedulesData = $schedules->map(function ($schedule) {
            return [
                'id' => $schedule->id,
                'child_id' => $schedule->child_id,
                'child_name' => $schedule->child->full_name,
                'title' => $schedule->title,
                'type' => $schedule->type,
                'scheduled_for' => $schedule->scheduled_for->format('Y-m-d'),
                'is_urgent' => \Carbon\Carbon::now()->diffInDays($schedule->scheduled_for, false) <= 7,
            ];
        });

        return response()->json([
            'data' => $schedulesData,
        ], 200);
    }

    /**
     * Get list of all children for parent (ibu)
     *
     * Returns list of children with basic info and latest nutritional status
     */
    public function children(Request $request): JsonResponse
    {
        $user = $request->user();

        // Authorization: only for ibu role
        if (!$user->isIbu()) {
            return response()->json([
                'message' => 'Unauthorized. This endpoint is only for parents.',
            ], 403);
        }

        $now = Carbon::now();

        // Get all children of this parent
        $children = Child::where('parent_id', $user->id)
            ->where('is_active', true)
            ->with(['posyandu', 'weighingLogs' => function ($query) {
                $query->orderBy('measured_at', 'desc')->limit(1);
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        $childrenData = [];

        foreach ($children as $child) {
            $latestWeighing = $child->weighingLogs->first();

            $childrenData[] = [
                'id' => $child->id,
                'full_name' => $child->full_name,
                'birth_date' => $child->birth_date->format('Y-m-d'),
                'gender' => $child->gender,
                'age_in_months' => $child->age_in_months, // Use model accessor
                'posyandu' => $child->posyandu ? [
                    'id' => $child->posyandu->id,
                    'name' => $child->posyandu->name,
                ] : null,
                'posyandu_id' => $child->posyandu_id, // Add posyandu_id for filtering
                'weighing_logs' => $child->weighingLogs->map(function ($log) {
                    return [
                        'id' => $log->id,
                        'weight_kg' => $log->weight_kg,
                        'height_cm' => $log->height_cm,
                        'muac_cm' => $log->muac_cm,
                        'head_circumference_cm' => $log->head_circumference_cm,
                        'measured_at' => $log->measured_at->format('Y-m-d'),
                        'nutritional_status' => $log->nutritional_status,
                        'zscore_wfa' => $log->zscore_wfa,
                        'zscore_hfa' => $log->zscore_hfa,
                        'zscore_wfh' => $log->zscore_wfh,
                    ];
                })->toArray(),
                'latest_nutritional_status' => [
                    'status' => $latestWeighing ? $latestWeighing->nutritional_status : 'tidak_diketahui',
                    'measured_at' => $latestWeighing ? $latestWeighing->measured_at->format('Y-m-d') : null,
                ],
            ];
        }

        return response()->json([
            'data' => $childrenData,
        ], 200);
    }

    /**
     * Get detailed information about a specific child
     *
     * Returns child data with weighing logs, meal logs, and immunization schedules
     */
    public function showChild(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        // Authorization: only for ibu role
        if (!$user->isIbu()) {
            return response()->json([
                'message' => 'Unauthorized. This endpoint is only for parents.',
            ], 403);
        }

        // Get child with relationships
        $child = Child::with([
            'posyandu',
            'weighingLogs' => function ($query) {
                $query->orderBy('measured_at', 'desc');
            },
            'mealLogs' => function ($query) {
                $query->orderBy('eaten_at', 'desc')->limit(10);
            },
            'immunizationSchedules' => function ($query) {
                $query->orderBy('scheduled_for', 'asc');
            },
        ])->find($id);

        // Check if child exists
        if (!$child) {
            return response()->json([
                'message' => 'Child not found.',
            ], 404);
        }

        // Authorization: check if child belongs to this parent
        if ($child->parent_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized. You can only view your own children.',
            ], 403);
        }

        $now = Carbon::now();
        $ageInDays = $child->birth_date->diffInDays($now);

        // Format weighing logs
        $weighingLogs = $child->weighingLogs->map(function ($log) {
            return [
                'id' => $log->id,
                'measured_at' => $log->measured_at->format('Y-m-d'),
                'weight_kg' => $log->weight_kg,
                'height_cm' => $log->height_cm,
                'muac_cm' => $log->muac_cm,
                'head_circumference_cm' => $log->head_circumference_cm,
                'nutritional_status' => $log->nutritional_status,
                'zscore_hfa' => $log->zscore_hfa,
                'zscore_wfa' => $log->zscore_wfa,
                'zscore_wfh' => $log->zscore_wfh,
            ];
        });

        // Format meal logs
        $mealLogs = $child->mealLogs->map(function ($log) {
            return [
                'id' => $log->id,
                'eaten_at' => $log->eaten_at->format('Y-m-d'),
                'time_of_day' => $log->time_of_day,
                'description' => $log->description,
                'ingredients' => $log->ingredients,
                'source' => $log->source,
            ];
        });

        // Format immunization schedules
        $immunizationSchedules = $child->immunizationSchedules->map(function ($schedule) {
            return [
                'id' => $schedule->id,
                'title' => $schedule->title,
                'type' => $schedule->type,
                'scheduled_for' => $schedule->scheduled_for->format('Y-m-d'),
                'completed_at' => $schedule->completed_at ? $schedule->completed_at->format('Y-m-d') : null,
            ];
        });

        return response()->json([
            'data' => [
                'id' => $child->id,
                'full_name' => $child->full_name,
                'nik' => $child->nik,
                'birth_date' => $child->birth_date->format('Y-m-d'),
                'gender' => $child->gender,
                'birth_weight_kg' => $child->birth_weight_kg,
                'birth_height_cm' => $child->birth_height_cm,
                'age_in_months' => $child->age_in_months, // Use model accessor
                'age_in_days' => $ageInDays,
                'notes' => $child->notes,
                'is_active' => $child->is_active,
                'created_at' => $child->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $child->updated_at->format('Y-m-d H:i:s'),
                'posyandu' => $child->posyandu ? [
                    'id' => $child->posyandu->id,
                    'name' => $child->posyandu->name,
                ] : null,
                'weighing_logs' => $weighingLogs,
                'meal_logs' => $mealLogs,
                'immunization_schedules' => $immunizationSchedules,
            ],
        ], 200);
    }

    /**
     * Get AI-powered menu recommendations for a child based on available ingredients
     * Integrates with n8n workflow using Google Gemini for intelligent recommendations
     */
    public function nutriAssist(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        // Authorization: only for ibu role
        if (!$user->isIbu()) {
            return response()->json([
                'message' => 'Unauthorized. This endpoint is only for parents.',
            ], 403);
        }

        // Get child and verify ownership
        $child = Child::with(['weighingLogs' => function ($query) {
            $query->orderBy('measured_at', 'desc')->limit(1);
        }])->find($id);

        if (!$child) {
            return response()->json([
                'message' => 'Child not found.',
            ], 404);
        }

        // Authorization: check if child belongs to this parent
        if ($child->parent_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized. You can only get recommendations for your own children.',
            ], 403);
        }

        // Validate input
        $validated = $request->validate([
            'ingredients' => ['required', 'array', 'min:1', 'max:20'],
            'ingredients.*' => ['required', 'string', 'max:100'],
            'date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        // Get child age from model accessor
        $ageInMonths = $child->age_in_months;

        // Check if n8n is enabled
        if (!config('services.n8n.enabled')) {
            return $this->getFallbackNutriAssist($child, $validated['ingredients'], $ageInMonths);
        }

        // Try to get from cache first (24 hours)
        $cacheKey = 'nutriassist_' . $child->id . '_' . md5(json_encode($validated['ingredients']));
        
        try {
            $recommendations = \Illuminate\Support\Facades\Cache::remember($cacheKey, 86400, function () use ($child, $validated) {
                return $this->getAINutriAssist($child, $validated);
            });

            return response()->json([
                'success' => true,
                'data' => $recommendations,
            ], 200);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('NutriAssist AI Error: ' . $e->getMessage(), [
                'child_id' => $child->id,
                'ingredients' => $validated['ingredients'],
                'error' => $e->getMessage(),
            ]);

            // Fallback to basic recommendations
            return $this->getFallbackNutriAssist($child, $validated['ingredients'], $ageInMonths);
        }
    }

    /**
     * Get AI recommendations from n8n workflow
     */
    private function getAINutriAssist(Child $child, array $validated): array
    {
        $webhookUrl = config('services.n8n.webhook_url');
        $apiKey = config('services.n8n.api_key');
        $timeout = config('services.n8n.timeout', 30);

        if (!$webhookUrl || !$apiKey) {
            throw new \Exception('n8n webhook URL or API key not configured');
        }

        $response = \Illuminate\Support\Facades\Http::timeout($timeout)->post($webhookUrl, [
            'child_id' => $child->id,
            'ingredients' => $validated['ingredients'],
            'date' => $validated['date'] ?? now()->toDateString(),
            'notes' => $validated['notes'] ?? null,
            'api_key' => $apiKey,
        ]);

        if ($response->failed()) {
            throw new \Exception('n8n webhook request failed: ' . $response->status());
        }

        $result = $response->json();

        if (!isset($result['success']) || !$result['success']) {
            throw new \Exception('n8n returned unsuccessful response');
        }

        return $result['data'];
    }

    /**
     * Fallback to basic recommendations when AI is unavailable
     */
    private function getFallbackNutriAssist(Child $child, array $ingredients, int $ageInMonths): JsonResponse
    {
        \Illuminate\Support\Facades\Log::info('Using fallback NutriAssist recommendations', [
            'child_id' => $child->id,
            'reason' => 'n8n unavailable or disabled',
        ]);

        // Get recommendations using NutritionService
        $recommendations = $this->nutritionService->getRecommendations(
            $child->id,
            $ingredients,
            $ageInMonths
        );

        return response()->json([
            'success' => true,
            'data' => [
                'child' => [
                    'id' => $child->id,
                    'full_name' => $child->full_name,
                    'age_in_months' => $ageInMonths,
                ],
                'recommendations' => $recommendations,
                'advice' => [
                    'general' => 'Sistem AI sedang tidak tersedia. Berikut rekomendasi dasar berdasarkan bahan yang tersedia.',
                    'nutritional_focus' => 'Pastikan anak mendapat nutrisi seimbang dari berbagai kelompok makanan.',
                ],
                'metadata' => [
                    'ingredients_provided' => count($ingredients),
                    'recommendations_count' => count($recommendations),
                    'generated_at' => now()->toISOString(),
                    'ai_powered' => false,
                    'fallback' => true,
                ],
            ],
        ], 200);
    }

    /**
     * Get growth chart data for parent's children
     *
     * Returns weight measurements over time for charting
     */
    public function growthChart(Request $request): JsonResponse
    {
        $user = $request->user();

        // Authorization: only for ibu role
        if (!$user->isIbu()) {
            return response()->json([
                'message' => 'Unauthorized. This endpoint is only for parents.',
            ], 403);
        }

        // Get all children IDs
        $childIds = Child::where('parent_id', $user->id)
            ->where('is_active', true)
            ->pluck('id');

        if ($childIds->isEmpty()) {
            return response()->json([
                'data' => [
                    'datasets' => [],
                    'message' => 'No children found',
                ],
            ], 200);
        }

        // Get weighing logs for all children (last 12 months)
        $weighingLogs = \App\Models\WeighingLog::whereIn('child_id', $childIds)
            ->where('measured_at', '>=', Carbon::now()->subMonths(12))
            ->orderBy('measured_at', 'asc')
            ->get();

        // Group by month and calculate average weight
        $monthlyData = [];

        foreach ($weighingLogs as $log) {
            $monthKey = $log->measured_at->format('Y-m');

            if (!isset($monthlyData[$monthKey])) {
                $monthlyData[$monthKey] = [
                    'month' => $log->measured_at->format('M'),
                    'year' => $log->measured_at->format('Y'),
                    'total_weight' => 0,
                    'count' => 0,
                    'measurements' => [],
                ];
            }

            $monthlyData[$monthKey]['total_weight'] += $log->weight_kg;
            $monthlyData[$monthKey]['count']++;
            $monthlyData[$monthKey]['measurements'][] = [
                'weight' => $log->weight_kg,
                'height' => $log->height_cm,
                'date' => $log->measured_at->format('Y-m-d'),
            ];
        }

        // Calculate averages and format for chart
        $chartData = [];
        foreach ($monthlyData as $key => $data) {
            $chartData[] = [
                'month' => $data['month'],
                'year' => $data['year'],
                'averageWeight' => round($data['total_weight'] / $data['count'], 1),
                'measurementCount' => $data['count'],
                'measurements' => $data['measurements'],
            ];
        }

        return response()->json([
            'data' => [
                'chartData' => $chartData,
                'totalMeasurements' => $weighingLogs->count(),
            ],
        ], 200);
    }

    /**
     * Calculate schedule status for dashboard stats
     */
    private function calculateScheduleStatus($childIds): array
    {
        $now = Carbon::now();

        // Count upcoming schedules for current month (remaining days)
        $currentMonthCount = \App\Models\ImmunizationSchedule::whereIn('child_id', $childIds)
            ->where('scheduled_for', '>=', $now)
            ->where('scheduled_for', '<=', $now->copy()->endOfMonth())
            ->whereNull('completed_at')
            ->count();

        if ($currentMonthCount > 0) {
            return [
                'count' => $currentMonthCount,
                'label' => 'Bulan Ini',
                'has_schedule' => true
            ];
        }

        // Count schedules for next month
        $nextMonthCount = \App\Models\ImmunizationSchedule::whereIn('child_id', $childIds)
            ->where('scheduled_for', '>=', $now->copy()->addMonth()->startOfMonth())
            ->where('scheduled_for', '<=', $now->copy()->addMonth()->endOfMonth())
            ->whereNull('completed_at')
            ->count();

        if ($nextMonthCount > 0) {
            return [
                'count' => $nextMonthCount,
                'label' => 'Bulan Depan',
                'has_schedule' => true
            ];
        }

        return [
            'count' => 0,
            'label' => 'Tidak Ada Kegiatan',
            'has_schedule' => false
        ];
    }
}
