<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Subject;
use App\Models\User;
use App\Models\LearningResource;
use App\Models\Enrollment;

class LearningModule extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject_id',
        'created_by',
        'title',
        'slug',
        'description',
        'level',
        'status',
    ];

    /**
     * The accessors to append to the model's array form.
     */
    protected $appends = ['level_label'];

    /**
     * Get the subject this module belongs to.
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Get the user who created this module.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the resources for this module.
     */
    public function resources(): HasMany
    {
        return $this->hasMany(LearningResource::class, 'module_id')->orderBy('sort_order');
    }

    /**
     * Get enrollments for this module.
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class, 'module_id');
    }

    /**
     * Scope to only published modules.
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    /**
     * Get human-readable level name.
     */
    public function getLevelLabelAttribute(): string
    {
        return match ($this->level) {
            'elementary' => 'Elementary',
            'junior_high' => 'Junior High School',
            'senior_high' => 'Senior High School',
            default => $this->level,
        };
    }
}
