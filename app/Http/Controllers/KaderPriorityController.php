<?php

namespace App\Http\Controllers;

use App\Services\PriorityChildService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KaderPriorityController extends Controller
{
    protected $priorityService;

    public function __construct(PriorityChildService $priorityService)
    {
        $this->priorityService = $priorityService;
    }

    /**
     * Get list of priority children in kader's posyandu
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->posyandu_id) {
            return response()->json([
                'message' => 'Kader tidak memiliki posyandu yang terdaftar.',
            ], 400);
        }

        $result = $this->priorityService->getPriorityChildren($user->posyandu_id);

        return response()->json([
            'data' => $result['children'],
            'summary' => $result['summary'],
        ], 200);
    }
}
