<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Child extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'posyandu_id',
        'full_name',
        'nik',
        'birth_date',
        'gender',
        'birth_weight_kg',
        'birth_height_cm',
        'notes',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'birth_weight_kg' => 'decimal:1',
            'birth_height_cm' => 'decimal:1',
            'is_active' => 'boolean',
        ];
    }

    // Relationships
    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function posyandu(): BelongsTo
    {
        return $this->belongsTo(Posyandu::class, 'posyandu_id');
    }

    public function weighingLogs(): HasMany
    {
        return $this->hasMany(WeighingLog::class);
    }

    public function mealLogs(): HasMany
    {
        return $this->hasMany(MealLog::class);
    }

    public function immunizationSchedules(): HasMany
    {
        return $this->hasMany(ImmunizationSchedule::class);
    }
}
