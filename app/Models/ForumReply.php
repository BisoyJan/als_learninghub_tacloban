<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\ForumThread;
use App\Models\User;

class ForumReply extends Model
{
    protected $fillable = [
        'thread_id',
        'user_id',
        'body',
    ];

    /**
     * Get the reply author.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent thread.
     */
    public function thread(): BelongsTo
    {
        return $this->belongsTo(ForumThread::class, 'thread_id');
    }
}
