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
                'email_notifications' => (bool) $user->email_notifications,
                'push_notifications' => (bool) $user->push_notifications,
                'sms_notifications' => (bool) $user->sms_notifications,
                'marketing_emails' => (bool) $user->marketing_emails,
                'notification_frequency' => $user->notification_frequency ?? 'instant',
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
            'email_notifications' => ['required', 'boolean'],
            'push_notifications' => ['required', 'boolean'],
            'sms_notifications' => ['required', 'boolean'],
            'marketing_emails' => ['required', 'boolean'],
            'notification_frequency' => ['required', 'string', 'in:instant,daily,weekly'],
        ]);

        // Update user settings
        $user->email_notifications = $validated['email_notifications'];
        $user->push_notifications = $validated['push_notifications'];
        $user->sms_notifications = $validated['sms_notifications'];
        $user->marketing_emails = $validated['marketing_emails'];
        $user->notification_frequency = $validated['notification_frequency'];
        $user->save();

        return response()->json([
            'message' => 'Settings updated successfully.',
            'data' => [
                'email_notifications' => (bool) $user->email_notifications,
                'push_notifications' => (bool) $user->push_notifications,
                'sms_notifications' => (bool) $user->sms_notifications,
                'marketing_emails' => (bool) $user->marketing_emails,
                'notification_frequency' => $user->notification_frequency,
            ],
        ], 200);
    }
}

