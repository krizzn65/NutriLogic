<?php

namespace App\Http\Controllers;

use App\Models\WeighingLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminWeighingController extends Controller
{
    /**
     * Get list of all weighing logs with filters (read-only)
     */
    public function index(Request $request): JsonResponse
    {
        $query = WeighingLog::with(['child.parent', 'child.posyandu']);

        // Filter by posyandu
        if ($request->has('posyandu_id') && $request->posyandu_id) {
            $query->whereHas('child', function ($q) use ($request) {
                $q->where('posyandu_id', $request->posyandu_id);
            });
        }

        // Filter by date range
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('measured_at', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('measured_at', '<=', $request->date_to);
        }

        // Filter by nutritional status
        if ($request->has('nutritional_status') && $request->nutritional_status) {
            $query->where('nutritional_status', $request->nutritional_status);
        }

        $weighings = $query->orderBy('measured_at', 'desc')->get()->map(function ($weighing) {
            return [
                'id' => $weighing->id,
                'measured_at' => $weighing->measured_at,
                'weight_kg' => $weighing->weight_kg,
                'height_cm' => $weighing->height_cm,
                'head_circumference_cm' => $weighing->head_circumference_cm,
                'muac_cm' => $weighing->muac_cm,
                'bb_u_status' => $weighing->bb_u_status,
                'tb_u_status' => $weighing->tb_u_status,
                'bb_tb_status' => $weighing->bb_tb_status,
                'imt_u_status' => $weighing->imt_u_status,
                'muac_status' => $weighing->muac_status,
                'nutritional_status' => $weighing->nutritional_status,
                'notes' => $weighing->notes,
                'child' => $weighing->child ? [
                    'id' => $weighing->child->id,
                    'full_name' => $weighing->child->full_name,
                    'gender' => $weighing->child->gender,
                    'birth_date' => $weighing->child->birth_date->format('Y-m-d'),
                    'parent' => $weighing->child->parent ? [
                        'id' => $weighing->child->parent->id,
                        'name' => $weighing->child->parent->name,
                    ] : null,
                    'posyandu' => $weighing->child->posyandu ? [
                        'id' => $weighing->child->posyandu->id,
                        'name' => $weighing->child->posyandu->name,
                    ] : null,
                ] : null,
            ];
        });

        return response()->json([
            'data' => $weighings,
        ], 200);
    }

    /**
     * Get weighing detail (read-only)
     */
    public function show(Request $request, $id): JsonResponse
    {
        $weighing = WeighingLog::with(['child.parent', 'child.posyandu'])->find($id);

        if (!$weighing) {
            return response()->json([
                'message' => 'Data penimbangan tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'data' => [
                'id' => $weighing->id,
                'measured_at' => $weighing->measured_at,
                'weight_kg' => $weighing->weight_kg,
                'height_cm' => $weighing->height_cm,
                'head_circumference_cm' => $weighing->head_circumference_cm,
                'muac_cm' => $weighing->muac_cm,
                'bb_u_status' => $weighing->bb_u_status,
                'tb_u_status' => $weighing->tb_u_status,
                'bb_tb_status' => $weighing->bb_tb_status,
                'imt_u_status' => $weighing->imt_u_status,
                'muac_status' => $weighing->muac_status,
                'nutritional_status' => $weighing->nutritional_status,
                'notes' => $weighing->notes,
                'child' => $weighing->child ? [
                    'id' => $weighing->child->id,
                    'full_name' => $weighing->child->full_name,
                    'gender' => $weighing->child->gender,
                    'birth_date' => $weighing->child->birth_date->format('Y-m-d'),
                    'parent' => $weighing->child->parent ? [
                        'id' => $weighing->child->parent->id,
                        'name' => $weighing->child->parent->name,
                    ] : null,
                    'posyandu' => $weighing->child->posyandu ? [
                        'id' => $weighing->child->posyandu->id,
                        'name' => $weighing->child->posyandu->name,
                    ] : null,
                ] : null,
            ],
        ], 200);
    }
}
