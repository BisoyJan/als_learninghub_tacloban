<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LearningSession extends Model
{
    protected $fillable = [
        'module_id',
        'teacher_id',
        'title',
        'description',
        'scheduled_at',
        'duration_minutes',
        'location',
        'mode',
        'status',
        'notes',
    ];

    protected $appends = ['mode_label', 'status_label', 'ends_at'];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
        ];
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(LearningModule::class, 'module_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(SessionAttendance::class, 'session_id');
    }

    public function getModeLabel(): string
    {
        return match ($this->mode) {
            'in_person' => 'In Person',
            'online' => 'Online',
            'hybrid' => 'Hybrid',
            default => $this->mode,
        };
    }

    public function getModeLabelAttribute(): string
    {
        return $this->getModeLabel();
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'upcoming' => 'Upcoming',
            'ongoing' => 'Ongoing',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled',
            default => $this->status,
        };
    }

    public function getEndsAtAttribute(): string
    {
        return $this->scheduled_at->addMinutes($this->duration_minutes)->toISOString();
    }

    /** Scope: only upcoming sessions */
    public function scopeUpcoming($query)
    {
        return $query->where('status', 'upcoming')->where('scheduled_at', '>=', now());
    }

    /** Scope: sessions for a specific module */
    public function scopeForModule($query, int $moduleId)
    {
        return $query->where('module_id', $moduleId);
    }
}
