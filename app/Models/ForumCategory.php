<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use App\Models\ForumThread;

class ForumCategory extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'color',
        'sort_order',
    ];

    protected static function booted(): void
    {
        static::creating(function (ForumCategory $category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });
    }

    /**
     * Get threads in this category.
     */
    public function threads(): HasMany
    {
        return $this->hasMany(ForumThread::class, 'category_id');
    }

    /**
     * Scope: ordered by sort_order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }
}
