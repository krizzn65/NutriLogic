<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParentSettingsController extends Controller
{
    /**
     * Get user settings
     * 
     * Returns current user's settings/preferences
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

        return response()->json([
            'data' => [
                'notification_channel' => $user->notification_channel ?? 'none',
            ],
        ], 200);
    }

    /**
     * Update user settings
     * 
     * Updates user's preferences/settings
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        // Authorization: only for ibu role
        if (!$user->isIbu()) {
            return response()->json([
                'message' => 'Unauthorized. This endpoint is only for parents.',
            ], 403);
        }

        // Validate input
        $validated = $request->validate([
            'notification_channel' => ['required', 'string', 'in:none,whatsapp,email'],
        ]);

        // Update user settings
        $user->notification_channel = $validated['notification_channel'];
        $user->save();

        return response()->json([
            'message' => 'Settings updated successfully.',
            'data' => [
                'notification_channel' => $user->notification_channel,
            ],
        ], 200);
    }
}

