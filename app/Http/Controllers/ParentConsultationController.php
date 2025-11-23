<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\Consultation;
use App\Models\ConsultationMessage;
use App\Models\User;
use App\Services\PointsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParentConsultationController extends Controller
{
    public function __construct(
        private PointsService $pointsService
    ) {
    }
    /**
     * Get list of consultations for parent (ibu)
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

        $query = Consultation::where('parent_id', $user->id)
            ->with(['kader', 'child', 'messages' => function ($q) {
                $q->orderBy('created_at', 'desc')->limit(1)->with('sender');
            }])
            ->orderBy('updated_at', 'desc');

        // Optional filter by status
        if ($request->has('status') && in_array($request->status, ['open', 'closed'])) {
            $query->where('status', $request->status);
        }

        $consultations = $query->get();

        $consultationsData = $consultations->map(function ($consultation) {
            $lastMessage = $consultation->messages->first();
            
            return [
                'id' => $consultation->id,
                'title' => $consultation->title,
                'status' => $consultation->status,
                'child' => $consultation->child ? [
                    'id' => $consultation->child->id,
                    'full_name' => $consultation->child->full_name,
                ] : null,
                'kader' => $consultation->kader ? [
                    'id' => $consultation->kader->id,
                    'name' => $consultation->kader->name,
                ] : null,
                'last_message' => $lastMessage ? [
                    'message' => $lastMessage->message,
                    'sender_name' => $lastMessage->sender->name,
                    'created_at' => $lastMessage->created_at->format('Y-m-d H:i:s'),
                ] : null,
                'created_at' => $consultation->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $consultation->updated_at->format('Y-m-d H:i:s'),
            ];
        });

        return response()->json([
            'data' => $consultationsData,
        ], 200);
    }

    /**
     * Create new consultation
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        // Authorization: only for ibu role
        if (!$user->isIbu()) {
            return response()->json([
                'message' => 'Unauthorized. This endpoint is only for parents.',
            ], 403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'child_id' => ['nullable', 'integer', 'exists:children,id'],
            'kader_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        // Validate child ownership if child_id is provided
        if (isset($validated['child_id'])) {
            $child = Child::findOrFail($validated['child_id']);
            if ($child->parent_id !== $user->id) {
                return response()->json([
                    'message' => 'Unauthorized. You can only create consultations for your own children.',
                ], 403);
            }

            // Auto-assign kader from child's posyandu if kader_id not provided
            if (!isset($validated['kader_id']) && $child->posyandu_id) {
                $kader = User::where('posyandu_id', $child->posyandu_id)
                    ->where('role', 'kader')
                    ->first();
                
                if ($kader) {
                    $validated['kader_id'] = $kader->id;
                }
            }
        }

        // Validate kader role if kader_id is provided
        if (isset($validated['kader_id'])) {
            $kader = User::findOrFail($validated['kader_id']);
            if (!$kader->isKader()) {
                return response()->json([
                    'message' => 'Invalid kader. The selected user is not a kader.',
                ], 422);
            }
        }

        $validated['parent_id'] = $user->id;
        $validated['status'] = 'open';

        $consultation = Consultation::create($validated);
        $consultation->load(['parent', 'kader', 'child']);

        return response()->json([
            'data' => $consultation,
            'message' => 'Consultation created successfully.',
        ], 201);
    }

    /**
     * Get consultation detail with all messages
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        // Authorization: only for ibu role
        if (!$user->isIbu()) {
            return response()->json([
                'message' => 'Unauthorized. This endpoint is only for parents.',
            ], 403);
        }

        $consultation = Consultation::with([
            'parent',
            'kader',
            'child',
            'messages.sender'
        ])->find($id);

        if (!$consultation) {
            return response()->json([
                'message' => 'Consultation not found.',
            ], 404);
        }

        // Authorization: check if consultation belongs to this parent
        if ($consultation->parent_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized. You can only view your own consultations.',
            ], 403);
        }

        // Order messages by created_at ASC
        $messages = $consultation->messages()->orderBy('created_at', 'asc')->get();

        return response()->json([
            'data' => [
                'id' => $consultation->id,
                'title' => $consultation->title,
                'status' => $consultation->status,
                'parent' => [
                    'id' => $consultation->parent->id,
                    'name' => $consultation->parent->name,
                ],
                'kader' => $consultation->kader ? [
                    'id' => $consultation->kader->id,
                    'name' => $consultation->kader->name,
                ] : null,
                'child' => $consultation->child ? [
                    'id' => $consultation->child->id,
                    'full_name' => $consultation->child->full_name,
                ] : null,
                'messages' => $messages->map(function ($message) {
                    return [
                        'id' => $message->id,
                        'sender_id' => $message->sender_id,
                        'sender_name' => $message->sender->name,
                        'sender_role' => $message->sender->role,
                        'message' => $message->message,
                        'created_at' => $message->created_at->format('Y-m-d H:i:s'),
                    ];
                }),
                'created_at' => $consultation->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $consultation->updated_at->format('Y-m-d H:i:s'),
            ],
        ], 200);
    }

    /**
     * Send a new message in consultation
     */
    public function sendMessage(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        // Authorization: only for ibu role
        if (!$user->isIbu()) {
            return response()->json([
                'message' => 'Unauthorized. This endpoint is only for parents.',
            ], 403);
        }

        $consultation = Consultation::find($id);

        if (!$consultation) {
            return response()->json([
                'message' => 'Consultation not found.',
            ], 404);
        }

        // Authorization: check if consultation belongs to this parent
        if ($consultation->parent_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized. You can only send messages in your own consultations.',
            ], 403);
        }

        $validated = $request->validate([
            'message' => ['required', 'string', 'min:1', 'max:2000'],
        ]);

        $message = ConsultationMessage::create([
            'consultation_id' => $consultation->id,
            'sender_id' => $user->id,
            'message' => $validated['message'],
        ]);

        // Update consultation updated_at
        $consultation->touch();

        // Add points and check badges for ibu role only
        if ($user->isIbu()) {
            $this->pointsService->addPoints($user, 3, 'consultation_message');
        }

        $message->load('sender');

        return response()->json([
            'data' => [
                'id' => $message->id,
                'sender_id' => $message->sender_id,
                'sender_name' => $message->sender->name,
                'sender_role' => $message->sender->role,
                'message' => $message->message,
                'created_at' => $message->created_at->format('Y-m-d H:i:s'),
            ],
            'message' => 'Message sent successfully.',
        ], 201);
    }
}

