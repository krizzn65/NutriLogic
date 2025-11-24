<?php

namespace App\Services;

use App\Models\Child;
use Carbon\Carbon;

class NutritionService
{
    /**
     * Get menu recommendations based on ingredients and child age
     */
    public function getRecommendations(int $childId, array $ingredients, ?int $ageInMonths = null): array
    {
        $child = Child::findOrFail($childId);
        
        // Calculate age if not provided
        if (!$ageInMonths) {
            $ageInMonths = Carbon::parse($child->birth_date)->diffInMonths(now());
        }

        // Simple menu database (in production, this should be in database)
        $menuDatabase = $this->getMenuDatabase();

        // Filter menus by age
        $suitableMenus = array_filter($menuDatabase, function ($menu) use ($ageInMonths) {
            return $ageInMonths >= $menu['min_age'] && $ageInMonths <= $menu['max_age'];
        });

        // Match ingredients with menus
        $matchedMenus = [];
        $ingredientsLower = array_map('strtolower', $ingredients);

        foreach ($suitableMenus as $menu) {
            $menuIngredientsLower = array_map('strtolower', $menu['ingredients']);
            $matchedCount = count(array_intersect($ingredientsLower, $menuIngredientsLower));
            
            if ($matchedCount > 0) {
                $matchPercentage = ($matchedCount / count($menu['ingredients'])) * 100;
                $matchedMenus[] = [
                    'menu' => $menu,
                    'match_percentage' => round($matchPercentage, 1),
                    'matched_ingredients' => array_intersect($ingredientsLower, $menuIngredientsLower),
                ];
            }
        }

        // Sort by match percentage
        usort($matchedMenus, function ($a, $b) {
            return $b['match_percentage'] <=> $a['match_percentage'];
        });

        return array_slice($matchedMenus, 0, 5); // Return top 5 recommendations
    }

    /**
     * Simple menu database (should be in database in production)
     */
    private function getMenuDatabase(): array
    {
        return [
            [
                'name' => 'Bubur Beras Merah + Hati Ayam',
                'ingredients' => ['beras merah', 'hati ayam', 'wortel', 'bayam'],
                'min_age' => 6,
                'max_age' => 12,
                'calories' => 120,
                'protein' => 8,
                'description' => 'Kaya zat besi dan protein untuk pertumbuhan optimal',
            ],
            [
                'name' => 'Puree Ubi + Telur',
                'ingredients' => ['ubi', 'telur', 'brokoli'],
                'min_age' => 6,
                'max_age' => 12,
                'calories' => 100,
                'protein' => 6,
                'description' => 'Sumber karbohidrat dan protein yang mudah dicerna',
            ],
            [
                'name' => 'Nasi Tim + Ikan + Sayur',
                'ingredients' => ['beras', 'ikan', 'wortel', 'kacang panjang'],
                'min_age' => 9,
                'max_age' => 24,
                'calories' => 150,
                'protein' => 10,
                'description' => 'Menu lengkap dengan karbohidrat, protein, dan serat',
            ],
            [
                'name' => 'Bubur Kacang Hijau',
                'ingredients' => ['kacang hijau', 'gula merah'],
                'min_age' => 8,
                'max_age' => 24,
                'calories' => 130,
                'protein' => 7,
                'description' => 'Sumber protein nabati dan energi',
            ],
            [
                'name' => 'Puree Pisang + Alpukat',
                'ingredients' => ['pisang', 'alpukat'],
                'min_age' => 6,
                'max_age' => 12,
                'calories' => 90,
                'protein' => 2,
                'description' => 'Kaya lemak sehat dan mudah dicerna',
            ],
            [
                'name' => 'Bubur Ayam + Sayuran',
                'ingredients' => ['beras', 'ayam', 'wortel', 'bayam', 'kentang'],
                'min_age' => 8,
                'max_age' => 24,
                'calories' => 140,
                'protein' => 9,
                'description' => 'Menu lengkap dengan berbagai nutrisi',
            ],
        ];
    }
}

