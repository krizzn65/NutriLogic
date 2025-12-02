<?php

namespace App\Http\Controllers;

use App\Services\PointsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParentPointsController extends Controller
{
    public function __construct(
        private PointsService $pointsService
    ) {
    }

    /**
     * Get points and badges for parent (ibu)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Authorization: only for ibu role
        if (!$user->isIbu()) {
            return response()->json([
                'message' => 'Unauthorized. This endpoint is only for parents.',
            ], 403);
        }

        // Load user with badges
        $user->load('badges');

        // Get badge definitions
        $badgeDefinitions = $this->pointsService->getBadgeDefinitions();

        // Map badges with earned status
        $badgeDefinitionsWithStatus = array_map(function ($badgeDef) use ($user) {
            return [
                'code' => $badgeDef['code'],
                'name' => $badgeDef['name'],
                'description' => $badgeDef['description'],
                'icon' => $badgeDef['icon'] ?? '',
                'is_earned' => $user->hasBadge($badgeDef['code']),
            ];
        }, $badgeDefinitions);

        // Format earned badges
        $earnedBadges = $user->badges->map(function ($badge) use ($badgeDefinitions) {
            $badgeDef = collect($badgeDefinitions)->firstWhere('code', $badge->badge_code);
            
            return [
                'id' => $badge->id,
                'badge_code' => $badge->badge_code,
                'badge_name' => $badgeDef['name'] ?? $badge->badge_code,
                'badge_description' => $badgeDef['description'] ?? '',
                'icon' => $badgeDef['icon'] ?? '',
                'earned_at' => $badge->earned_at->format('Y-m-d H:i:s'),
            ];
        })->sortByDesc('earned_at')->values();

        return response()->json([
            'data' => [
                'total_points' => $user->points ?? 0,
                'total_activities' => $this->pointsService->getTotalActivities($user),
                'badges' => $earnedBadges,
                'badge_definitions' => $badgeDefinitionsWithStatus,
            ],
        ], 200);
    }
}

