<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'project_id',
        'created_by',
        'title',
        'description',
        'status',
        'priority',
        'due_date'
    ];

    // Project (nullable for personal)
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    // Creator
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Assigned users
    public function assignees()
    {
        return $this->belongsToMany(User::class, 'task_user')
            ->withTimestamps();
    }

    // Check if personal task
    public function isPersonal()
    {
        return is_null($this->project_id);
    }
}
