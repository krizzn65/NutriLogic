<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImmunizationSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'child_id',
        'title',
        'type',
        'scheduled_for',
        'completed_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_for' => 'date',
            'completed_at' => 'date',
        ];
    }

    // Relationships
    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }
}
