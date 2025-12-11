<?php

namespace App\Http\Controllers;

use App\Models\BroadcastLog;
use App\Models\Notification;
use App\Models\User;
use App\Services\N8nBroadcastService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KaderBroadcastController extends Controller
{
    public function __construct(
        private N8nBroadcastService $broadcastService
    ) {}
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

        // Trigger WhatsApp broadcast via n8n
        $waResult = $this->broadcastService->sendBroadcast($broadcast, $parents);

        $message = 'Broadcast berhasil dikirim ke ' . $parents->count() . ' orang tua.';
        if ($waResult['success'] && $waResult['sent_count'] > 0) {
            $message .= ' WhatsApp terkirim ke ' . $waResult['sent_count'] . ' nomor.';
        }

        return response()->json([
            'data' => $broadcast->load('sender'),
            'message' => $message,
            'whatsapp' => $waResult,
        ], 201);
    }


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

        // Delete associated notifications first
        Notification::where('type', 'broadcast')
            ->where('metadata->broadcast_id', $broadcast->id)
            ->delete();

        $broadcast->delete();

        return response()->json([
            'message' => 'Broadcast berhasil dihapus.',
        ], 200);
    }
}
