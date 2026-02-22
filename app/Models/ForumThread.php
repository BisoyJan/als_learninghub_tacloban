<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\ForumCategory;
use App\Models\ForumReply;

class ForumThread extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'body',
        'slug',
        'is_pinned',
        'is_locked',
    ];

    protected $appends = ['reply_count'];

    protected function casts(): array
    {
        return [
            'is_pinned' => 'boolean',
            'is_locked' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (ForumThread $thread) {
            if (empty($thread->slug)) {
                $thread->slug = Str::slug($thread->title) . '-' . Str::random(6);
            }
        });
    }

    /**
     * Get the thread author.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the category.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ForumCategory::class, 'category_id');
    }

    /**
     * Get replies.
     */
    public function replies(): HasMany
    {
        return $this->hasMany(ForumReply::class, 'thread_id');
    }

    /**
     * Get reply count.
     */
    public function getReplyCountAttribute(): int
    {
        return $this->replies()->count();
    }

    /**
     * Scope: pinned first, then newest.
     */
    public function scopeOrdered($query)
    {
        return $query->orderByDesc('is_pinned')->orderByDesc('created_at');
    }
}
