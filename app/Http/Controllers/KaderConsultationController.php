<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use App\Models\ConsultationMessage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KaderConsultationController extends Controller
{
    /**
     * Get list of consultations for kader's posyandu
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->posyandu_id) {
            return response()->json([
                'message' => 'Kader tidak memiliki posyandu yang terdaftar.',
            ], 400);
        }

        // Get consultations where parent is in same posyandu
        $query = Consultation::with(['parent', 'child', 'kader'])
            ->whereHas('parent', function ($q) use ($user) {
                $q->where('posyandu_id', $user->posyandu_id);
            });

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $consultations = $query->orderBy('updated_at', 'desc')->get();

        // Add last message to each consultation
        $consultations->each(function ($consultation) {
            $lastMessage = $consultation->messages()
                ->orderBy('created_at', 'desc')
                ->first();

            $consultation->last_message = $lastMessage ? [
                'message' => $lastMessage->message,
                'created_at' => $lastMessage->created_at,
                'sender_name' => $lastMessage->sender->name ?? 'Unknown',
            ] : null;
        });

        return response()->json([
            'data' => $consultations,
        ], 200);
    }

    /**
     * Get consultation detail with all messages
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $consultation = Consultation::with(['parent', 'child', 'kader'])
            ->findOrFail($id);

        // Authorization: parent must be in same posyandu
        if ($user->posyandu_id && $consultation->parent->posyandu_id !== $user->posyandu_id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        // Get all messages
        $messages = $consultation->messages()
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'data' => [
                'consultation' => $consultation,
                'messages' => $messages,
            ],
        ], 200);
    }

    /**
     * Add new message to consultation
     */
    public function storeMessage(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $consultation = Consultation::with('parent')->findOrFail($id);

        // Authorization
        if ($user->posyandu_id && $consultation->parent->posyandu_id !== $user->posyandu_id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ]);

        // Create message
        $message = ConsultationMessage::create([
            'consultation_id' => $consultation->id,
            'sender_id' => $user->id,
            'message' => $validated['message'],
        ]);

        // Update consultation timestamp
        $consultation->touch();

        // If kader_id is null, assign current kader
        if (!$consultation->kader_id) {
            $consultation->update(['kader_id' => $user->id]);
        }

        return response()->json([
            'data' => $message->load('sender'),
            'message' => 'Pesan berhasil dikirim.',
        ], 201);
    }

    /**
     * Close consultation
     */
    public function close(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $consultation = Consultation::with('parent')->findOrFail($id);

        // Authorization
        if ($user->posyandu_id && $consultation->parent->posyandu_id !== $user->posyandu_id) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        $consultation->update(['status' => 'closed']);

        return response()->json([
            'data' => $consultation,
            'message' => 'Konsultasi berhasil ditutup.',
        ], 200);
    }
}
