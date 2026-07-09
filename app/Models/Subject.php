<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\LearningModule;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'strand_code',
        'description',
    ];

    protected $appends = ['strand_label'];

    /**
     * Get the modules for this subject.
     */
    public function modules(): HasMany
    {
        return $this->hasMany(LearningModule::class);
    }

    /**
     * Human-readable ALS learning strand label.
     */
    public function getStrandLabelAttribute(): ?string
    {
        return match ($this->strand_code) {
            'LS1' => 'LS1 - Communication Skills',
            'LS2' => 'LS2 - Scientific Literacy & Critical Thinking',
            'LS3' => 'LS3 - Mathematical & Problem-Solving Skills',
            'LS4' => 'LS4 - Life & Career Skills',
            'LS5' => 'LS5 - Understanding the Self & Society',
            'LS6' => 'LS6 - Digital Citizenship',
            default => null,
        };
    }
}
