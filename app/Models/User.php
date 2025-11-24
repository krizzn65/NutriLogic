<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'posyandu_id',
        'points',
        'notification_channel',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'points' => 'integer',
        ];
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is kader.
     */
    public function isKader(): bool
    {
        return $this->role === 'kader';
    }

    /**
     * Check if user is ibu.
     */
    public function isIbu(): bool
    {
        return $this->role === 'ibu';
    }

    // Relationships
    public function posyandu(): BelongsTo
    {
        return $this->belongsTo(Posyandu::class);
    }

    public function children(): HasMany
    {
        return $this->hasMany(Child::class, 'parent_id');
    }

    public function consultationsAsParent(): HasMany
    {
        return $this->hasMany(Consultation::class, 'parent_id');
    }

    public function consultationsAsKader(): HasMany
    {
        return $this->hasMany(Consultation::class, 'kader_id');
    }

    public function consultationMessages(): HasMany
    {
        return $this->hasMany(ConsultationMessage::class, 'sender_id');
    }

    public function badges(): HasMany
    {
        return $this->hasMany(UserBadge::class);
    }

    /**
     * Check if user has a specific badge
     */
    public function hasBadge(string $badgeCode): bool
    {
        return $this->badges()->where('badge_code', $badgeCode)->exists();
    }
}
