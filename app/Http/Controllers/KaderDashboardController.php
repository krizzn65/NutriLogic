<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\Consultation;
use App\Models\ImmunizationSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KaderDashboardController extends Controller
{
    /**
     * Get dashboard data for kader
     * Shows statistics and highlights for kader's posyandu
     */
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get posyandu data
        $posyandu = $user->posyandu;

        if (!$posyandu) {
            return response()->json([
                'message' => 'Kader tidak memiliki posyandu yang terdaftar.',
            ], 400);
        }

        // Get all children in this posyandu
        $totalChildren = Child::where('posyandu_id', $posyandu->id)->count();
        $activeChildren = Child::where('posyandu_id', $posyandu->id)
            ->where('is_active', true)
            ->count();

        // Get nutritional status distribution
        // We need to get the latest weighing log for each child
        $nutritionalStatus = DB::table('children')
            ->leftJoin('weighing_logs', function ($join) {
                $join->on('children.id', '=', 'weighing_logs.child_id')
                    ->whereRaw('weighing_logs.id = (
                        SELECT id FROM weighing_logs wl2 
                        WHERE wl2.child_id = children.id 
                        ORDER BY wl2.measured_at DESC 
                        LIMIT 1
                    )');
            })
            ->where('children.posyandu_id', $posyandu->id)
            ->where('children.is_active', true)
            ->select(
                DB::raw('COALESCE(weighing_logs.nutritional_status, "tidak_diketahui") as status'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();

        // Count priority children (those with non-normal status)
        $priorityChildren = DB::table('children')
            ->leftJoin('weighing_logs', function ($join) {
                $join->on('children.id', '=', 'weighing_logs.child_id')
                    ->whereRaw('weighing_logs.id = (
                        SELECT id FROM weighing_logs wl2 
                        WHERE wl2.child_id = children.id 
                        ORDER BY wl2.measured_at DESC 
                        LIMIT 1
                    )');
            })
            ->where('children.posyandu_id', $posyandu->id)
            ->where('children.is_active', true)
            ->where('weighing_logs.nutritional_status', '!=', 'normal')
            ->whereNotNull('weighing_logs.nutritional_status')
            ->count();

        // Get next schedule (upcoming immunization/posyandu)
        $nextSchedule = ImmunizationSchedule::whereHas('child', function ($query) use ($posyandu) {
                $query->where('posyandu_id', $posyandu->id);
            })
            ->where('scheduled_for', '>=', now())
            ->whereNull('completed_at')
            ->orderBy('scheduled_for', 'asc')
            ->first();

        // Get open consultations count
        $openConsultations = Consultation::whereHas('parent.children', function ($query) use ($posyandu) {
                $query->where('posyandu_id', $posyandu->id);
            })
            ->where('status', 'open')
            ->count();

        return response()->json([
            'data' => [
                'posyandu' => [
                    'id' => $posyandu->id,
                    'name' => $posyandu->name,
                    'address' => $posyandu->address,
                    'village' => $posyandu->village,
                    'district' => $posyandu->district,
                ],
                'statistics' => [
                    'total_children' => $totalChildren,
                    'active_children' => $activeChildren,
                    'nutritional_status' => [
                        'normal' => $nutritionalStatus['normal'] ?? 0,
                        'pendek' => $nutritionalStatus['pendek'] ?? 0,
                        'sangat_pendek' => $nutritionalStatus['sangat_pendek'] ?? 0,
                        'kurang' => $nutritionalStatus['kurang'] ?? 0,
                        'sangat_kurang' => $nutritionalStatus['sangat_kurang'] ?? 0,
                        'kurus' => $nutritionalStatus['kurus'] ?? 0,
                        'sangat_kurus' => $nutritionalStatus['sangat_kurus'] ?? 0,
                        'lebih' => $nutritionalStatus['lebih'] ?? 0,
                        'gemuk' => $nutritionalStatus['gemuk'] ?? 0,
                        'tidak_diketahui' => $nutritionalStatus['tidak_diketahui'] ?? 0,
                    ],
                    'priority_children' => $priorityChildren,
                ],
                'highlights' => [
                    'next_schedule' => $nextSchedule ? [
                        'id' => $nextSchedule->id,
                        'title' => $nextSchedule->title,
                        'type' => $nextSchedule->type,
                        'scheduled_for' => $nextSchedule->scheduled_for->format('Y-m-d'),
                        'child_name' => $nextSchedule->child->full_name ?? null,
                    ] : null,
                    'open_consultations' => $openConsultations,
                ],
            ],
        ], 200);
    }
}
