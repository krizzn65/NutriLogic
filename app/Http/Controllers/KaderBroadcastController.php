<?php

namespace App\Http\Controllers;

use App\Models\BroadcastLog;
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

        // TODO: Future - Trigger n8n webhook for WhatsApp/Telegram delivery
        // $this->triggerN8nWebhook($broadcast);

        return response()->json([
            'data' => $broadcast->load('sender'),
            'message' => 'Broadcast berhasil dikirim.',
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
}
