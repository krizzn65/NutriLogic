<?php

namespace App\Http\Controllers;

use App\Services\PointsService;
use App\Services\PriorityChildService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParentPointsController extends Controller
{
    public function __construct(
        private PointsService $pointsService,
        private PriorityChildService $priorityService
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

        // Load user with badges and children
        $user->load(['badges', 'children' => function ($query) {
            $query->where('is_active', true)->with('pmtLogs');
        }]);

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

        // Calculate PMT compliance for each child
        $childrenWithCompliance = $user->children->map(function ($child) {
            $pmtCompliance = $this->priorityService->calculatePMTCompliancePublic($child);
            
            return [
                'id' => $child->id,
                'full_name' => $child->full_name,
                'gender' => $child->gender,
                'age_in_months' => $child->age_in_months,
                'pmt_compliance_percentage' => $pmtCompliance,
                'is_eligible_priority' => $pmtCompliance >= 80,
            ];
        });

        return response()->json([
            'data' => [
                'total_points' => $user->points ?? 0,
                'total_activities' => $this->pointsService->getTotalActivities($user),
                'badges' => $earnedBadges,
                'badge_definitions' => $badgeDefinitionsWithStatus,
                'children' => $childrenWithCompliance,
            ],
        ], 200);
    }
}


