<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get all notifications for authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $notifications = Notification::forUser($user->id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'link' => $notification->link,
                    'is_read' => $notification->is_read,
                    'timestamp' => $notification->created_at->diffForHumans(),
                    'created_at' => $notification->created_at->toDateTimeString(),
                    'metadata' => $notification->metadata,
                ];
            });

        return response()->json([
            'data' => $notifications,
            'unread_count' => Notification::forUser($user->id)->unread()->count(),
        ], 200);
    }

    /**
     * Get unread notifications only (and persistent broadcasts)
     */
    public function unread(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $notifications = Notification::forUser($user->id)
            ->where(function($query) {
                $query->where('is_read', false)
                      ->orWhere('type', 'broadcast');
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'link' => $notification->link,
                    'is_read' => $notification->is_read,
                    'timestamp' => $notification->created_at->diffForHumans(),
                    'created_at' => $notification->created_at->toDateTimeString(),
                    'metadata' => $notification->metadata,
                ];
            });

        return response()->json([
            'data' => $notifications,
        ], 200);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        
        $notification = Notification::forUser($user->id)->findOrFail($id);
        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read.',
        ], 200);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();
        
        Notification::forUser($user->id)
            ->unread()
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'message' => 'All notifications marked as read.',
        ], 200);
    }

    /**
     * Delete notification
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        
        $notification = Notification::forUser($user->id)->findOrFail($id);
        $notification->delete();

        return response()->json([
            'message' => 'Notification deleted.',
        ], 200);
    }

    /**
     * Delete all read notifications
     */
    public function deleteRead(Request $request): JsonResponse
    {
        $user = $request->user();
        
        Notification::forUser($user->id)
            ->where('is_read', true)
            ->delete();

        return response()->json([
            'message' => 'All read notifications deleted.',
        ], 200);
    }
}
