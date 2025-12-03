<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PmtLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'child_id',
        'date',
        'status',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    /**
     * Get the child that owns the PMT log.
     */
    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }
}
