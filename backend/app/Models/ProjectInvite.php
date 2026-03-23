<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectInvite extends Model
{
    protected $fillable = [
        'project_id',
        'user_id',
        'invited_by',
        'role',
        'status'
    ];

    // =========================
    // RELATIONSHIPS (IMPORTANT)
    // =========================

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function inviter()
    {
        return $this->belongsTo(User::class, 'invited_by');
    }
}
