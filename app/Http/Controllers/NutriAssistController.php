<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Services\NutritionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NutriAssistController extends Controller
{
    protected NutritionService $nutritionService;

    public function __construct(NutritionService $nutritionService)
    {
        $this->nutritionService = $nutritionService;
    }

    /**
     * Get menu recommendations based on ingredients
     */
    public function recommend(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'child_id' => ['required', 'integer', 'exists:children,id'],
            'ingredients' => ['required', 'array', 'min:1'],
            'ingredients.*' => ['required', 'string'],
            'age_in_months' => ['nullable', 'integer', 'min:0', 'max:60'],
        ]);

        $user = $request->user();
        $child = Child::findOrFail($validated['child_id']);

        // Authorization check
        if ($user->isIbu() && $child->parent_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        $recommendations = $this->nutritionService->getRecommendations(
            $validated['child_id'],
            $validated['ingredients'],
            $validated['age_in_months'] ?? null
        );

        return response()->json([
            'data' => $recommendations,
            'child' => $child,
        ], 200);
    }
}

