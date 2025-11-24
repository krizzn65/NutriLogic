<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MealLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'child_id',
        'eaten_at',
        'time_of_day',
        'description',
        'ingredients',
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
