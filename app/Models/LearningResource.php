<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use App\Models\LearningModule;
use App\Models\User;

class LearningResource extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id',
        'uploaded_by',
        'title',
        'description',
        'type',
        'file_path',
        'external_url',
        'file_size',
        'mime_type',
        'sort_order',
    ];

    /**
     * The accessors to append to the model's array form.
     */
    protected $appends = ['url', 'file_size_formatted'];

    /**
     * Get the module this resource belongs to.
     */
    public function module(): BelongsTo
    {
        return $this->belongsTo(LearningModule::class, 'module_id');
    }

    /**
     * Get the user who uploaded this resource.
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get the download/view URL for this resource.
     */
    public function getUrlAttribute(): ?string
    {
        if ($this->external_url) {
            return $this->external_url;
        }

        if ($this->file_path) {
            return Storage::disk('public')->url($this->file_path);
        }

        return null;
    }

    /**
     * Get human-readable file size.
     */
    public function getFileSizeFormattedAttribute(): ?string
    {
        if (!$this->file_size) {
            return null;
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $size = $this->file_size;
        $unitIndex = 0;

        while ($size >= 1024 && $unitIndex < count($units) - 1) {
            $size /= 1024;
            $unitIndex++;
        }

        return round($size, 1) . ' ' . $units[$unitIndex];
    }
}
