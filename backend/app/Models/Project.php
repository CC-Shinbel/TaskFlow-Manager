<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'name',
        'description',
        'owner_id'
    ];

    // Real project owner
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    // All project members
    public function users()
    {
        return $this->belongsToMany(User::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    // Tasks under project
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
