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
                'attachment_type' => $lastMessage->attachment_type,
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

        // Get all messages with attachment details
        $messages = $consultation->messages()
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'sender_id' => $message->sender_id,
                    'sender_name' => $message->sender->name,
                    'sender_role' => $message->sender->role,
                    'message' => $message->message,
                    'attachment_path' => $message->attachment_path ? url('storage/' . $message->attachment_path) : null,
                    'attachment_type' => $message->attachment_type,
                    'created_at' => $message->created_at,
                ];
            });

        // Transform consultation data
        $consultationData = [
            'id' => $consultation->id,
            'title' => $consultation->title,
            'status' => $consultation->status,
            'parent' => $consultation->parent ? [
                'id' => $consultation->parent->id,
                'name' => $consultation->parent->name,
                'is_online' => $consultation->parent->is_online,
            ] : null,
            'child' => $consultation->child ? [
                'id' => $consultation->child->id,
                'full_name' => $consultation->child->full_name,
            ] : null,
            'kader' => $consultation->kader ? [
                'id' => $consultation->kader->id,
                'name' => $consultation->kader->name,
            ] : null,
            'messages' => $messages,
            'created_at' => $consultation->created_at,
            'updated_at' => $consultation->updated_at,
        ];

        return response()->json([
            'data' => $consultationData,
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
            'message' => ['nullable', 'string', 'max:2000'],
            'attachment' => ['nullable', 'file', 'image', 'max:5120'], // Max 5MB
        ]);

        if (empty($validated['message']) && empty($request->file('attachment'))) {
            return response()->json(['message' => 'Message or attachment is required.'], 422);
        }

        $attachmentPath = null;
        $attachmentType = null;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $path = $file->store('consultation-attachments', 'public');
            $attachmentPath = $path;
            $attachmentType = 'image'; // For now only images
        }

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

        // Create notification for Parent
        if ($consultation->parent_id) {
            \App\Models\Notification::create([
                'user_id' => $consultation->parent_id,
                'type' => 'info',
                'title' => 'Balasan dari Kader',
                'message' => $user->name . ' membalas konsultasi Anda: "' . ($validated['message'] ?? '[Gambar]') . '"',
                'link' => '/parent/konsultasi/' . $consultation->id,
                'metadata' => [
                    'consultation_id' => $consultation->id,
                    'kader_id' => $user->id,
                    'kader_name' => $user->name,
                    'has_attachment' => $attachmentPath ? true : false,
                ],
            ]);
        }

        $message->load('sender');

        return response()->json([
            'data' => [
                'id' => $message->id,
                'sender_id' => $message->sender_id,
                'sender_name' => $message->sender->name,
                'sender_role' => $message->sender->role,
                'message' => $message->message,
                'attachment_path' => $message->attachment_path ? url('storage/' . $message->attachment_path) : null,
                'attachment_type' => $message->attachment_type,
                'created_at' => $message->created_at,
            ],
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

        // Log activity
        $parentName = $consultation->parent ? $consultation->parent->name : 'Unknown';
        AdminActivityLogController::log(
            'update',
            "Kader {$user->name} menutup konsultasi dengan {$parentName}: {$consultation->title}",
            'Consultation',
            $consultation->id
        );

        return response()->json([
            'data' => $consultation,
            'message' => 'Konsultasi berhasil ditutup.',
        ], 200);
    }

    /**
     * Delete consultation
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $consultation = Consultation::with(['parent', 'child'])->findOrFail($id);

        // Authorization: kader can delete if assigned OR child belongs to their posyandu
        if (
            $consultation->kader_id !== $user->id &&
            (!$user->posyandu_id || $consultation->child->posyandu_id !== $user->posyandu_id)
        ) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        $title = $consultation->title;
        $parentName = $consultation->parent ? $consultation->parent->name : 'Unknown';
        $consultation->delete();

        // Log activity
        AdminActivityLogController::log(
            'delete',
            "Kader {$user->name} menghapus konsultasi dengan {$parentName}: {$title}",
            'Consultation',
            $id
        );

        return response()->json([
            'message' => 'Consultation deleted successfully.',
        ], 200);
    }

    /**
     * Get child data for sharing in consultation
     */
    public function getChildData(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $consultation = Consultation::with('child.weighingLogs')->findOrFail($id);

        // Authorization: kader can access if assigned OR child belongs to their posyandu
        if (
            $consultation->kader_id !== $user->id &&
            (!$user->posyandu_id || $consultation->child->posyandu_id !== $user->posyandu_id)
        ) {
            return response()->json([
                'message' => 'Unauthorized access.',
            ], 403);
        }

        if (!$consultation->child) {
            return response()->json([
                'message' => 'No child associated with this consultation.',
            ], 404);
        }

        $child = $consultation->child;
        $latestLog = $child->weighingLogs()->latest('measured_at')->first();

        return response()->json([
            'data' => [
                'name' => $child->full_name,
                'age_months' => $child->age_in_months,
                'gender' => $child->gender,
                'weight' => $latestLog ? $latestLog->weight_kg : null,
                'height' => $latestLog ? $latestLog->height_cm : null,
                'head_circumference' => $latestLog ? $latestLog->head_circumference_cm : null,
                'notes' => $latestLog ? $latestLog->notes : null,
                'measured_at' => $latestLog ? $latestLog->measured_at : null,
            ],
        ], 200);
    }
}
