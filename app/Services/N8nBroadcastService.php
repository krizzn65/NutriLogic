<?php

namespace App\Services;

use App\Models\BroadcastLog;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class N8nBroadcastService
{
    /**
     * Trigger n8n webhook untuk broadcast WhatsApp
     */
    public function sendBroadcast(BroadcastLog $broadcast, Collection $recipients): array
    {
        $webhookUrl = config('services.n8n.broadcast_webhook_url');

        if (!$webhookUrl || !config('services.n8n.enabled')) {
            Log::info('N8N broadcast disabled or webhook URL not configured');
            return [
                'success' => false,
                'message' => 'WhatsApp broadcast tidak aktif',
                'sent_count' => 0,
            ];
        }

        // Filter recipients yang punya nomor HP
        $validRecipients = $recipients->filter(fn($user) => !empty($user->phone));

        if ($validRecipients->isEmpty()) {
            Log::info('No valid recipients with phone numbers for broadcast');
            return [
                'success' => false,
                'message' => 'Tidak ada penerima dengan nomor HP valid',
                'sent_count' => 0,
            ];
        }

        $payload = $this->buildPayload($broadcast, $validRecipients);

        try {
            $response = Http::timeout(config('services.n8n.timeout', 30))
                ->post($webhookUrl, $payload);

            if ($response->successful()) {
                Log::info('N8N broadcast webhook triggered successfully', [
                    'broadcast_id' => $broadcast->id,
                    'recipients_count' => $validRecipients->count(),
                ]);

                return [
                    'success' => true,
                    'message' => 'WhatsApp broadcast terkirim',
                    'sent_count' => $validRecipients->count(),
                ];
            }

            Log::error('N8N broadcast webhook failed', [
                'broadcast_id' => $broadcast->id,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [
                'success' => false,
                'message' => 'Gagal mengirim ke WhatsApp',
                'sent_count' => 0,
            ];
        } catch (\Exception $e) {
            Log::error('N8N broadcast webhook exception', [
                'broadcast_id' => $broadcast->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
                'sent_count' => 0,
            ];
        }
    }

    /**
     * Build payload untuk n8n webhook
     */
    private function buildPayload(BroadcastLog $broadcast, Collection $recipients): array
    {
        $sender = $broadcast->sender;
        $posyandu = $broadcast->posyandu;

        return [
            'broadcast_id' => $broadcast->id,
            'type' => $broadcast->type,
            'message' => $broadcast->message,
            'posyandu_name' => $posyandu->name ?? 'Posyandu',
            'kader_name' => $sender->name ?? 'Kader',
            'recipients' => $recipients->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'phone' => $this->formatPhoneNumber($user->phone),
                ];
            })->values()->toArray(),
        ];
    }

    /**
     * Format nomor telepon ke format internasional (62xxx)
     */
    private function formatPhoneNumber(?string $phone): string
    {
        if (empty($phone)) {
            return '';
        }

        // Hapus karakter non-digit
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // Konversi 08xx ke 628xx
        if (str_starts_with($phone, '0')) {
            $phone = '62' . substr($phone, 1);
        }

        // Jika belum ada 62, tambahkan
        if (!str_starts_with($phone, '62')) {
            $phone = '62' . $phone;
        }

        return $phone;
    }
}
