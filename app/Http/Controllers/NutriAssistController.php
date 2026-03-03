<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Services\NutritionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class NutriAssistController extends Controller
{
    protected NutritionService $nutritionService;
    private const DEFAULT_DAILY_LIMIT = 10;
    private const CACHE_TTL_SECONDS = 86400;

    public function __construct(NutritionService $nutritionService)
    {
        $this->nutritionService = $nutritionService;
    }

    /**
     * Get AI-powered menu recommendations based on ingredients
     * Uses n8n workflow with Google Gemini for intelligent recommendations
     */
    public function recommend(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'child_id' => ['required', 'integer', 'exists:children,id'],
            'ingredients' => ['required', 'array', 'min:1', 'max:20'],
            'ingredients.*' => ['required', 'string', 'max:100'],
            'date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $user = $request->user();
        $child = Child::with(['weighingLogs' => function ($query) {
            $query->orderBy('measured_at', 'desc')->limit(1);
        }])->findOrFail($validated['child_id']);

        // Authorization check
        if ($user->isIbu() && $child->parent_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        // Check if child has at least one weighing record
        if ($child->weighingLogs->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Anak belum memiliki data penimbangan. Silakan kunjungi Posyandu untuk penimbangan pertama agar dapat menggunakan fitur Nutri-Assist.',
                'requires_weighing' => true,
            ], 422);
        }

        $dailyLimit = (int) config('services.n8n.daily_limit', self::DEFAULT_DAILY_LIMIT);
        if (!$this->consumeDailyQuota($user->id, $dailyLimit)) {
            return response()->json([
                'success' => false,
                'message' => "Batas harian Nutri-Assist tercapai ({$dailyLimit} request/hari). Coba lagi besok.",
                'daily_limit' => $dailyLimit,
            ], 429);
        }

        // Check if n8n is enabled
        if (!config('services.n8n.enabled')) {
            return $this->getFallbackRecommendations($child, $validated['ingredients']);
        }

        // Try to get from cache first (24 hours)
        $cacheKey = 'nutriassist_' . $child->id . '_' . md5(json_encode($validated['ingredients']));
        $this->rememberChildCacheKey($child->id, $cacheKey);

        try {
            $recommendations = Cache::remember($cacheKey, self::CACHE_TTL_SECONDS, function () use ($child, $validated) {
                return $this->getAIRecommendations($child, $validated);
            });

            return response()->json([
                'success' => true,
                'data' => $recommendations,
            ], 200);
        } catch (\Exception $e) {
            Log::error('NutriAssist AI Error: ' . $e->getMessage(), [
                'child_id' => $child->id,
                'ingredients' => $validated['ingredients'],
                'error' => $e->getMessage(),
            ]);

            // Fallback to basic recommendations
            return $this->getFallbackRecommendations($child, $validated['ingredients']);
        }
    }

    /**
     * Get AI recommendations from n8n workflow
     */
    private function getAIRecommendations(Child $child, array $validated): array
    {
        $webhookUrl = config('services.n8n.webhook_url');
        $apiKey = config('services.n8n.api_key');
        $timeout = config('services.n8n.timeout', 30);

        if (!$webhookUrl || !$apiKey) {
            throw new \Exception('n8n webhook URL or API key not configured');
        }

        $response = Http::timeout($timeout)
            ->withHeaders([
                'X-API-KEY' => $apiKey,
            ])
            ->post($webhookUrl, [
                'child_id' => $child->id,
                'ingredients' => $validated['ingredients'],
                'date' => $validated['date'] ?? now()->toDateString(),
                'notes' => $validated['notes'] ?? null,
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
    private function getFallbackRecommendations(Child $child, array $ingredients): JsonResponse
    {
        Log::info('Using fallback recommendations', [
            'child_id' => $child->id,
            'reason' => 'n8n unavailable or disabled',
        ]);

        // Use existing NutritionService for basic recommendations
        $recommendations = $this->nutritionService->getRecommendations(
            $child->id,
            $ingredients,
            $child->age_in_months
        );

        return response()->json([
            'success' => true,
            'data' => [
                'child' => [
                    'id' => $child->id,
                    'full_name' => $child->full_name,
                    'age_in_months' => $child->age_in_months,
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
     * Clear recommendations cache for a child
     */
    public function clearCache(Request $request, int $childId): JsonResponse
    {
        $user = $request->user();
        $child = Child::findOrFail($childId);

        // Authorization check
        if ($user->isIbu() && $child->parent_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        // Clear only NutriAssist cache keys for this child
        $indexKey = $this->childCacheIndexKey($childId);
        $cacheKeys = Cache::get($indexKey, []);
        foreach ($cacheKeys as $cacheKey) {
            Cache::forget($cacheKey);
        }
        Cache::forget($indexKey);

        return response()->json([
            'success' => true,
            'message' => 'Cache cleared successfully',
        ], 200);
    }

    private function consumeDailyQuota(int $userId, int $dailyLimit): bool
    {
        $dailyKey = 'nutriassist_daily_' . $userId . '_' . now()->toDateString();
        $currentCount = (int) Cache::get($dailyKey, 0);

        if ($currentCount >= $dailyLimit) {
            return false;
        }

        Cache::put($dailyKey, $currentCount + 1, now()->endOfDay());

        return true;
    }

    private function rememberChildCacheKey(int $childId, string $cacheKey): void
    {
        $indexKey = $this->childCacheIndexKey($childId);
        $existingKeys = Cache::get($indexKey, []);

        if (!in_array($cacheKey, $existingKeys, true)) {
            $existingKeys[] = $cacheKey;
            Cache::put($indexKey, $existingKeys, now()->addDays(2));
        }
    }

    private function childCacheIndexKey(int $childId): string
    {
        return 'nutriassist_keys_' . $childId;
    }
}
