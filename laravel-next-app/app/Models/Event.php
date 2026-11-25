<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['title', 'starts_at', 'ends_at', 'memo'])]
class Event extends Model
{
    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    // この予定に関わる家族メンバー
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Member::class);
    }
}
