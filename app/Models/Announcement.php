<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'author_id',
        'title',
        'body',
        'audience',
        'is_pinned',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'is_pinned' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    /**
     * Get the author of the announcement.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Scope: only published announcements.
     */
    public function scopePublished($query)
    {
        return $query->whereNotNull('published_at')->where('published_at', '<=', now());
    }

    /**
     * Scope: announcements visible to a given role.
     */
    public function scopeForAudience($query, string $role)
    {
        return $query->where(function ($q) use ($role) {
            $q->where('audience', 'all')
              ->orWhere('audience', $role . 's'); // 'student' → 'students'
        });
    }

    /**
     * Scope: pinned first, then newest.
     */
    public function scopeOrdered($query)
    {
        return $query->orderByDesc('is_pinned')->orderByDesc('published_at');
    }

    /**
     * Get the audience label.
     */
    public function getAudienceLabelAttribute(): string
    {
        return match ($this->audience) {
            'all' => 'Everyone',
            'students' => 'Students Only',
            'teachers' => 'Teachers Only',
            'admins' => 'Admins Only',
            default => ucfirst($this->audience),
        };
    }
}
