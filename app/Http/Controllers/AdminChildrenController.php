<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\WeighingLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminChildrenController extends Controller
{
    /**
     * Get list of all children with filters (read-only)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Child::with(['parent', 'posyandu']);

        // Filter by name
        if ($request->has('name') && $request->name) {
            $query->where('full_name', 'like', '%' . $request->name . '%');
        }

        // Filter by posyandu
        if ($request->has('posyandu_id') && $request->posyandu_id) {
            $query->where('posyandu_id', $request->posyandu_id);
        }

        // Filter by nutritional status
        if ($request->has('nutritional_status') && $request->nutritional_status) {
            // Get children with specific nutritional status from latest weighing
            $childrenIds = WeighingLog::select('child_id')
                ->whereIn('id', function ($q) {
                    $q->select(DB::raw('MAX(id)'))
                        ->from('weighing_logs')
                        ->groupBy('child_id');
                })
                ->where('nutritional_status', $request->nutritional_status)
                ->pluck('child_id');

            $query->whereIn('id', $childrenIds);
        }

        // Filter by age range (in months)
        if ($request->has('age_min') && $request->age_min) {
            $query->whereRaw('TIMESTAMPDIFF(MONTH, date_of_birth, CURDATE()) >= ?', [$request->age_min]);
        }
        if ($request->has('age_max') && $request->age_max) {
            $query->whereRaw('TIMESTAMPDIFF(MONTH, date_of_birth, CURDATE()) <= ?', [$request->age_max]);
        }

        $children = $query->orderBy('created_at', 'desc')->get()->map(function ($child) {
            // Get latest weighing
            $latestWeighing = WeighingLog::where('child_id', $child->id)
                ->orderBy('measured_at', 'desc')
                ->first();

            // Calculate age in months
            $ageInMonths = $child->date_of_birth 
                ? now()->diffInMonths($child->date_of_birth) 
                : null;

            return [
                'id' => $child->id,
                'full_name' => $child->full_name,
                'gender' => $child->gender,
                'date_of_birth' => $child->date_of_birth,
                'age_months' => $ageInMonths,
                'parent' => $child->parent ? [
                    'id' => $child->parent->id,
                    'name' => $child->parent->name,
                ] : null,
                'posyandu' => $child->posyandu ? [
                    'id' => $child->posyandu->id,
                    'name' => $child->posyandu->name,
                ] : null,
                'latest_weighing' => $latestWeighing ? [
                    'weight' => $latestWeighing->weight_kg,
                    'height' => $latestWeighing->height_cm,
                    'nutritional_status' => $latestWeighing->nutritional_status,
                    'weighing_date' => $latestWeighing->measured_at,
                ] : null,
            ];
        });

        return response()->json([
            'data' => $children,
        ], 200);
    }

    /**
     * Get child detail with weighing history (read-only)
     */
    public function show(Request $request, $id): JsonResponse
    {
        $child = Child::with(['parent', 'posyandu'])->find($id);

        if (!$child) {
            return response()->json([
                'message' => 'Anak tidak ditemukan.',
            ], 404);
        }

        // Get weighing history (latest 10)
        $weighingHistory = WeighingLog::where('child_id', $child->id)
            ->orderBy('measured_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($weighing) {
                return [
                    'id' => $weighing->id,
                    'weight' => $weighing->weight_kg,
                    'height' => $weighing->height_cm,
                    'nutritional_status' => $weighing->nutritional_status,
                    'weighing_date' => $weighing->measured_at,
                    'notes' => $weighing->notes,
                ];
            });

        // Calculate age
        $ageInMonths = $child->date_of_birth 
            ? now()->diffInMonths($child->date_of_birth) 
            : null;

        return response()->json([
            'data' => [
                'id' => $child->id,
                'full_name' => $child->full_name,
                'gender' => $child->gender,
                'date_of_birth' => $child->date_of_birth,
                'age_months' => $ageInMonths,
                'parent' => $child->parent ? [
                    'id' => $child->parent->id,
                    'name' => $child->parent->name,
                    'email' => $child->parent->email,
                    'phone' => $child->parent->phone,
                ] : null,
                'posyandu' => $child->posyandu ? [
                    'id' => $child->posyandu->id,
                    'name' => $child->posyandu->name,
                    'village' => $child->posyandu->village,
                    'city' => $child->posyandu->city,
                ] : null,
                'weighing_history' => $weighingHistory,
            ],
        ], 200);
    }
}
