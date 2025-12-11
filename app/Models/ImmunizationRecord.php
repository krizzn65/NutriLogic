<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImmunizationRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'child_id',
        'posyandu_id',
        'vaccine_type',
        'immunization_date',
        'batch_number',
        'notes',
    ];

    protected $casts = [
        'immunization_date' => 'date',
    ];

    /**
     * Get the child that received the immunization
     */
    public function child()
    {
        return $this->belongsTo(Child::class);
    }

    /**
     * Get the posyandu where immunization was given
     */
    public function posyandu()
    {
        return $this->belongsTo(Posyandu::class);
    }

    /**
     * Get formatted vaccine type label
     */
    public function getVaccineTypeLabelAttribute()
    {
        return match($this->vaccine_type) {
            'bcg' => 'BCG',
            'hepatitis_b_0' => 'Hepatitis B 0 (HB0)',
            'hepatitis_b_1' => 'Hepatitis B 1',
            'hepatitis_b_2' => 'Hepatitis B 2',
            'hepatitis_b_3' => 'Hepatitis B 3',
            'polio_0' => 'Polio 0',
            'polio_1' => 'Polio 1',
            'polio_2' => 'Polio 2',
            'polio_3' => 'Polio 3',
            'polio_4' => 'Polio 4',
            'dpt_hib_hep_b_1' => 'DPT-HiB-HepB 1 (Pentavalent 1)',
            'dpt_hib_hep_b_2' => 'DPT-HiB-HepB 2 (Pentavalent 2)',
            'dpt_hib_hep_b_3' => 'DPT-HiB-HepB 3 (Pentavalent 3)',
            'ipv_1' => 'IPV 1 (Polio Suntik 1)',
            'ipv_2' => 'IPV 2 (Polio Suntik 2)',
            'campak_rubella_1' => 'Campak-Rubella 1 (MR1)',
            'campak_rubella_2' => 'Campak-Rubella 2 (MR2)',
            'other' => 'Lainnya',
            default => $this->vaccine_type,
        };
    }
}
