<?php

namespace App\Http\Controllers;

use App\Models\BroadcastLog;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KaderBroadcastController extends Controller
{
    /**
     * Get broadcast history for kader's posyandu
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->posyandu_id) {
            return response()->json([
                'message' => 'Kader tidak memiliki posyandu yang terdaftar.',
            ], 400);
        }

        $broadcasts = BroadcastLog::with('sender')
            ->where('posyandu_id', $user->posyandu_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $broadcasts,
        ], 200);
    }

    /**
     * Send new broadcast message
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->posyandu_id) {
            return response()->json([
                'message' => 'Kader tidak memiliki posyandu yang terdaftar.',
            ], 400);
        }

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
            'type' => ['required', 'string', 'in:jadwal_posyandu,info_gizi,pengumuman_umum,lainnya'],
        ]);

        $broadcast = BroadcastLog::create([
            'posyandu_id' => $user->posyandu_id,
            'sender_id' => $user->id,
            'message' => $validated['message'],
            'type' => $validated['type'],
        ]);

        // Create notifications for all parents in the same Posyandu
        $parents = User::where('role', 'ibu')
            ->where('posyandu_id', $user->posyandu_id)
            ->get();

        $typeLabels = [
            'jadwal_posyandu' => 'Jadwal Posyandu',
            'info_gizi' => 'Info Gizi',
            'pengumuman_umum' => 'Pengumuman',
            'lainnya' => 'Informasi',
        ];

        $title = $typeLabels[$validated['type']] ?? 'Pengumuman';

        foreach ($parents as $parent) {
            Notification::create([
                'user_id' => $parent->id,
                'type' => 'broadcast',
                'title' => $title . ' dari Posyandu',
                'message' => $validated['message'],
                'link' => '/dashboard/notifikasi',
                'is_read' => false,
                'metadata' => [
                    'broadcast_id' => $broadcast->id,
                    'broadcast_type' => $validated['type'],
                    'sender_name' => $user->name,
                ],
            ]);
        }

        return response()->json([
            'data' => $broadcast->load('sender'),
            'message' => 'Broadcast berhasil dikirim ke ' . $parents->count() . ' orang tua.',
        ], 201);
    }

    /**
     * Future: Trigger n8n webhook for message delivery
     * 
     * private function triggerN8nWebhook($broadcast)
     * {
     *     $webhookUrl = env('N8N_BROADCAST_WEBHOOK_URL');
     *     if (!$webhookUrl) return;
     *     
     *     // Send to n8n with broadcast data
     *     // n8n will handle WhatsApp/Telegram delivery
     * }
     */
    /**
     * Delete a broadcast message
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        $broadcast = BroadcastLog::where('id', $id)
            ->where('posyandu_id', $user->posyandu_id)
            ->first();

        if (!$broadcast) {
            return response()->json([
                'message' => 'Broadcast tidak ditemukan atau Anda tidak memiliki akses.',
            ], 404);
        }

        $broadcast->delete();

        return response()->json([
            'message' => 'Broadcast berhasil dihapus.',
        ], 200);
    }
}
