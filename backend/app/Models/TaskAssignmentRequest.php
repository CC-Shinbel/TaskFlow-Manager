<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskAssignmentRequest extends Model
{
    protected $table = 'task_assignment_requests';

    protected $fillable = [
        'task_id',
        'user_id',
        'assigned_by',
        'status'
    ];

    public $timestamps = true;

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
