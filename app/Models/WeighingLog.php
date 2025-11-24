<?php

namespace App\Models;

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
            'zscore_wfa' => 'decimal:2',
            'zscore_hfa' => 'decimal:2',
            'zscore_wfh' => 'decimal:2',
            'is_posyandu_day' => 'boolean',
        ];
    }

    // Relationships
    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }
}
