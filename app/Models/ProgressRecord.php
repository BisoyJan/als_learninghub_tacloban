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
        'competency_level',
        'remarks',
        'recorded_date',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'float',
            'max_score' => 'float',
            'recorded_date' => 'date',
        ];
    }

    protected $appends = ['type_label', 'percentage', 'competency_descriptor'];

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

    /**
     * Numeric percentage value (0-100) or null when unscored.
     */
    public function getPercentageValueAttribute(): ?float
    {
        if ($this->score === null) {
            return null;
        }

        if ($this->max_score && $this->max_score > 0) {
            return round(($this->score / $this->max_score) * 100, 1);
        }

        return (float) $this->score;
    }

    /**
     * ALS competency descriptor band. Uses an explicit competency_level when
     * set, otherwise derives the band from the numeric percentage (pass = 75).
     */
    public function getCompetencyDescriptorAttribute(): ?string
    {
        $level = $this->competency_level ?? self::deriveCompetencyLevel($this->percentage_value);

        return match ($level) {
            'mastered' => 'Mastered',
            'proficient' => 'Proficient',
            'developing' => 'Developing',
            'beginning' => 'Beginning',
            default => null,
        };
    }

    /**
     * Map a numeric percentage (0-100) to a competency band key.
     */
    public static function deriveCompetencyLevel(?float $percentage): ?string
    {
        if ($percentage === null) {
            return null;
        }

        return match (true) {
            $percentage >= 90 => 'mastered',
            $percentage >= 80 => 'proficient',
            $percentage >= 75 => 'developing',
            default => 'beginning',
        };
    }
}
