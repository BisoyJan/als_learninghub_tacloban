<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Enrollment;
use App\Models\User;

class ProgressRecord extends Model
{
    protected $fillable = [
        'enrollment_id',
        'recorded_by',
        'title',
        'type',
        'score',
        'max_score',
        'remarks',
        'recorded_date',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'decimal:2',
            'max_score' => 'decimal:2',
            'recorded_date' => 'date',
        ];
    }

    protected $appends = ['type_label', 'percentage'];

    /**
     * Get the enrollment this record belongs to.
     */
    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    /**
     * Get the user who recorded this entry.
     */
    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    /**
     * Get human-readable type label.
     */
    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            'assessment' => 'Assessment',
            'activity' => 'Activity',
            'milestone' => 'Milestone',
            default => $this->type,
        };
    }

    /**
     * Get score as percentage string.
     */
    public function getPercentageAttribute(): ?string
    {
        if ($this->score === null) {
            return null;
        }

        if ($this->max_score && $this->max_score > 0) {
            $pct = round(($this->score / $this->max_score) * 100, 1);
            return "{$pct}%";
        }

        return "{$this->score}%";
    }
}
