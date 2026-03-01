<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class MealLog extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'child_id',
        'eaten_at',
        'time_of_day',
        'description',
        'ingredients',
        'portion',
        'notes',
        'source',
    ];

    protected function casts(): array
    {
        return [
            'eaten_at' => 'date',
        ];
    }

    // Relationships
    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }
}
