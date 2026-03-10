<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TaskAssignmentRequestNotification extends Notification
{
    use Queueable;

    protected $task;
    protected $assignedBy;

    /**
     * Create a new notification instance.
     */
    public function __construct($task, $assignedBy)
    {
        $this->task = $task;
        $this->assignedBy = $assignedBy;
    }

    /**
     * Notification delivery channel
     */
    public function via($notifiable)
    {
        return ['database'];
    }

    /**
     * Data stored in notifications table
     */
    public function toDatabase($notifiable)
    {
        return [

            'type' => 'task_assignment',

            'task_id' => $this->task->id,
            'task_title' => $this->task->title,

            'assigned_by_id' => $this->assignedBy->id,
            'assigned_by_name' => $this->assignedBy->name

        ];
    }
}
