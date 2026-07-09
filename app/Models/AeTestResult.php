<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class AeTestResult extends Model
{
    protected $table = 'als_ae_results';

    protected $fillable = [
        'student_id',
        'recorded_by',
        'level',
        'test_date',
        'overall_score',
        'result',
        'certificate_no',
        'remarks',
    ];

    protected $appends = ['level_label', 'result_label'];

    protected function casts(): array
    {
        return [
            'test_date' => 'date',
            'overall_score' => 'float',
        ];
    }

    /**
     * The learner this A&E result belongs to.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * The user who recorded this result.
     */
    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    /**
     * Human-readable level label.
     */
    public function getLevelLabelAttribute(): string
    {
        return match ($this->level) {
            'elementary' => 'Elementary',
            'junior_high' => 'Junior High School',
            default => $this->level,
        };
    }

    /**
     * Human-readable result label.
     */
    public function getResultLabelAttribute(): string
    {
        return match ($this->result) {
            'passed' => 'Passed',
            'failed' => 'Failed',
            default => $this->result,
        };
    }
}
