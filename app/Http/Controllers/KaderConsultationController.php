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

        // Get consultations where:
        // 1. Child is in same posyandu as kader, OR
        // 2. Kader is assigned to this consultation
        $query = Consultation::with(['parent', 'child', 'kader', 'latestMessage.sender'])
            ->where(function ($q) use ($user) {
                $q->whereHas('child', function ($childQuery) use ($user) {
                    $childQuery->where('posyandu_id', $user->posyandu_id);
                })
                    ->orWhere('kader_id', $user->id);
            });

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Search by parent name or child name
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('parent', function ($parentQuery) use ($search) {
                    $parentQuery->where('name', 'like', "%{$search}%");
                })
                ->orWhereHas('child', function ($childQuery) use ($search) {
                    $childQuery->where('full_name', 'like', "%{$search}%");
                })
                ->orWhere('title', 'like', "%{$search}%");
            });
        }

        $consultations = $query->orderBy('updated_at', 'desc')->get();

        // Transform latest message (already eager loaded)
        $consultations->each(function ($consultation) {
            $lastMessage = $consultation->latestMessage;
            $consultation->last_message = $lastMessage ? [
                'message' => $lastMessage->message,
                'created_at' => $lastMessage->created_at,
                'sender_name' => $lastMessage->sender->name ?? 'Unknown',
            ] : null;
            // Remove the relation from response to avoid duplication
            unset($consultation->latestMessage);
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

        // Authorization: child must be in same posyandu OR kader is assigned
        if ($user->posyandu_id) {
            $hasAccess = ($consultation->child && $consultation->child->posyandu_id === $user->posyandu_id)
                || $consultation->kader_id === $user->id;

            if (!$hasAccess) {
                return response()->json([
                    'message' => 'Unauthorized access.',
                ], 403);
            }
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

        $consultation = Consultation::with(['parent', 'child'])->findOrFail($id);

        // Authorization: kader can access if assigned OR child belongs to their posyandu
        if (
            $consultation->kader_id !== $user->id &&
            (!$user->posyandu_id || $consultation->child->posyandu_id !== $user->posyandu_id)
        ) {
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

        $consultation = Consultation::with(['parent', 'child'])->findOrFail($id);

        // Authorization: kader can access if assigned OR child belongs to their posyandu
        if (
            $consultation->kader_id !== $user->id &&
            (!$user->posyandu_id || $consultation->child->posyandu_id !== $user->posyandu_id)
        ) {
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
