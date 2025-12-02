<?php

namespace App\Models;

use App\Services\ZScoreService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WeighingLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'child_id',
        'measured_at',
        'weight_kg',
        'height_cm',
        'muac_cm',
        'head_circumference_cm',
        'zscore_wfa',
        'zscore_hfa',
        'zscore_wfh',
        'nutritional_status',
        'is_posyandu_day',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'measured_at' => 'date',
            'weight_kg' => 'decimal:1',
            'height_cm' => 'decimal:1',
            'muac_cm' => 'decimal:1',
            'head_circumference_cm' => 'decimal:1',
            'zscore_wfa' => 'decimal:2',
            'zscore_hfa' => 'decimal:2',
            'zscore_wfh' => 'decimal:2',
            'is_posyandu_day' => 'boolean',
        ];
    }

    /**
     * Boot method - Auto-calculate Z-scores before saving
     */
    protected static function booted(): void
    {
        static::saving(function (WeighingLog $weighingLog) {
            // Only calculate if weight and child data exists
            if (!$weighingLog->weight_kg || !$weighingLog->child) {
                return;
            }

            $zScoreService = app(ZScoreService::class);
            $child = $weighingLog->child;

            // Calculate age at measurement date
            $birthDate = Carbon::parse($child->birth_date);
            $measuredAt = Carbon::parse($weighingLog->measured_at);
            $ageInDays = $zScoreService->calculateAgeInDays($birthDate, $measuredAt);

            // Calculate Z-scores
            $weighingLog->zscore_wfa = $zScoreService->calculateWFA(
                $ageInDays,
                $weighingLog->weight_kg,
                $child->gender
            );

            // Calculate HFA if height is provided
            if ($weighingLog->height_cm) {
                $weighingLog->zscore_hfa = $zScoreService->calculateHFA(
                    $ageInDays,
                    $weighingLog->height_cm,
                    $child->gender
                );

                // Calculate WFH if both weight and height are provided
                $weighingLog->zscore_wfh = $zScoreService->calculateWFH(
                    $weighingLog->height_cm,
                    $weighingLog->weight_kg,
                    $child->gender
                );
            }

            // Determine overall nutritional status
            $weighingLog->nutritional_status = $zScoreService->getOverallStatus(
                $weighingLog->zscore_hfa,
                $weighingLog->zscore_wfh,
                $weighingLog->zscore_wfa
            );
        });
    }

    // Relationships
    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }
}
