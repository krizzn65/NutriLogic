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
            'birth_weight_kg' => 'float',
            'birth_height_cm' => 'float',
            'is_active' => 'boolean',
        ];
    }

    protected $appends = ['age_in_months'];

    // Accessors
    public function getAgeInMonthsAttribute(): int
    {
        return $this->birth_date->diffInMonths(now());
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
        return $this->hasMany(WeighingLog::class)->orderBy('measured_at', 'desc');
    }

    public function mealLogs(): HasMany
    {
        return $this->hasMany(MealLog::class);
    }

    public function pmtLogs(): HasMany
    {
        return $this->hasMany(PmtLog::class)->orderBy('date', 'desc');
    }

    public function immunizationSchedules(): HasMany
    {
        return $this->hasMany(ImmunizationSchedule::class);
    }
}
