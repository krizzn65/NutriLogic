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
            $query->whereRaw('TIMESTAMPDIFF(MONTH, birth_date, CURDATE()) >= ?', [$request->age_min]);
        }
        if ($request->has('age_max') && $request->age_max) {
            $query->whereRaw('TIMESTAMPDIFF(MONTH, birth_date, CURDATE()) <= ?', [$request->age_max]);
        }

        $children = $query->orderBy('created_at', 'desc')->get()->map(function ($child) {
            // Get latest weighing
            $latestWeighing = WeighingLog::where('child_id', $child->id)
                ->orderBy('measured_at', 'desc')
                ->first();

            // Calculate age in months
            $ageInMonths = $child->birth_date 
                ? $child->birth_date->diffInMonths(now()) 
                : null;

            return [
                'id' => $child->id,
                'full_name' => $child->full_name,
                'nik' => $child->nik,
                'gender' => $child->gender,
                'birth_date' => $child->birth_date->format('Y-m-d'),
                'age_months' => $ageInMonths,
                'age_in_months' => $ageInMonths, // Alias for compatibility
                'birth_weight_kg' => $child->birth_weight_kg,
                'birth_height_cm' => $child->birth_height_cm,
                'notes' => $child->notes,
                'is_active' => $child->is_active,
                'parent' => $child->parent ? [
                    'id' => $child->parent->id,
                    'name' => $child->parent->name,
                ] : null,
                'parent_name' => $child->parent?->name,
                'posyandu' => $child->posyandu ? [
                    'id' => $child->posyandu->id,
                    'name' => $child->posyandu->name,
                ] : null,
                'posyandu_name' => $child->posyandu?->name,
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
     * Get child detail with complete history (read-only)
     */
    public function show(Request $request, $id): JsonResponse
    {
        $child = Child::with([
            'parent', 
            'posyandu',
            'weighingLogs' => function ($query) {
                $query->orderBy('measured_at', 'desc')->limit(10);
            },
            'vitaminDistributions' => function ($query) {
                $query->orderBy('distribution_date', 'desc')->limit(10);
            },
            'immunizationRecords' => function ($query) {
                $query->orderBy('immunization_date', 'desc')->limit(10);
            },
            'mealLogs' => function ($query) {
                $query->orderBy('eaten_at', 'desc')->limit(10);
            },
            'pmtLogs' => function ($query) {
                $query->orderBy('date', 'desc')->limit(10);
            },
        ])->find($id);

        if (!$child) {
            return response()->json([
                'message' => 'Anak tidak ditemukan.',
            ], 404);
        }

        // Calculate age
        $ageInMonths = $child->birth_date 
            ? $child->birth_date->diffInMonths(now()) 
            : null;

        return response()->json([
            'data' => [
                'id' => $child->id,
                'full_name' => $child->full_name,
                'gender' => $child->gender,
                'birth_date' => $child->birth_date->format('Y-m-d'),
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
                    'address' => $child->posyandu->address,
                    'village' => $child->posyandu->village,
                    'city' => $child->posyandu->city,
                ] : null,
                'weighing_logs' => $child->weighingLogs,
                'vitamin_distributions' => $child->vitaminDistributions,
                'immunization_records' => $child->immunizationRecords,
                'meal_logs' => $child->mealLogs,
                'pmt_logs' => $child->pmtLogs,
            ],
        ], 200);
    }
}
