<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;
use App\Models\LearningModule;
use App\Models\ProgressRecord;

class Enrollment extends Model
{
    protected $fillable = [
        'student_id',
        'module_id',
        'enrolled_by',
        'status',
        'time_spent_seconds',
        'last_accessed_at',
        'completed_at',
    ];

    protected $appends = ['status_label', 'average_score', 'time_spent_formatted'];

    protected function casts(): array
    {
        return [
            'completed_at' => 'datetime',
            'last_accessed_at' => 'datetime',
            'time_spent_seconds' => 'integer',
        ];
    }

    /**
     * Human-readable time spent (e.g. "2h 15m").
     */
    public function getTimeSpentFormattedAttribute(): string
    {
        $seconds = (int) $this->time_spent_seconds;
        if ($seconds < 60) {
            return '< 1m';
        }
        $hours = intdiv($seconds, 3600);
        $minutes = intdiv($seconds % 3600, 60);
        return ($hours > 0 ? "{$hours}h " : '') . "{$minutes}m";
    }

    /**
     * Get the enrolled student.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the learning module.
     */
    public function module(): BelongsTo
    {
        return $this->belongsTo(LearningModule::class, 'module_id');
    }

    /**
     * Get the user who enrolled this student.
     */
    public function enrolledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'enrolled_by');
    }

    /**
     * Get progress records for this enrollment.
     */
    public function progressRecords(): HasMany
    {
        return $this->hasMany(ProgressRecord::class)->orderBy('recorded_date', 'desc');
    }

    /**
     * Get human-readable status label.
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'enrolled' => 'Enrolled',
            'in_progress' => 'In Progress',
            'completed' => 'Completed',
            'dropped' => 'Dropped',
            default => $this->status,
        };
    }

    /**
     * Get average score across all progress records.
     */
    public function getAverageScoreAttribute(): ?float
    {
        $avg = $this->progressRecords()
            ->whereNotNull('score')
            ->avg('score');

        return $avg !== null ? round((float) $avg, 0) : null;
    }

    /**
     * Scope to only completed enrollments.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope to active enrollments (not dropped).
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['enrolled', 'in_progress', 'completed']);
    }
}
