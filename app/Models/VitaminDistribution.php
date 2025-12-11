<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VitaminDistribution extends Model
{
    use HasFactory;

    protected $fillable = [
        'child_id',
        'posyandu_id',
        'vitamin_type',
        'distribution_date',
        'dosage',
        'notes',
    ];

    protected $casts = [
        'distribution_date' => 'date',
    ];

    /**
     * Get the child that received the vitamin
     */
    public function child()
    {
        return $this->belongsTo(Child::class);
    }

    /**
     * Get the posyandu where vitamin was distributed
     */
    public function posyandu()
    {
        return $this->belongsTo(Posyandu::class);
    }

    /**
     * Get formatted vitamin type label
     */
    public function getVitaminTypeLabelAttribute()
    {
        return match($this->vitamin_type) {
            'vitamin_a_blue' => 'Vitamin A Biru (100.000 IU)',
            'vitamin_a_red' => 'Vitamin A Merah (200.000 IU)',
            'other' => 'Lainnya',
            default => $this->vitamin_type,
        };
    }
}
