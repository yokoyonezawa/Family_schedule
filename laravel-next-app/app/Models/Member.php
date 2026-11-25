<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['name', 'color'])]
class Member extends Model
{
    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class);
    }
}
