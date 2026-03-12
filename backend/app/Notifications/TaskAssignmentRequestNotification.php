<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TaskAssignmentRequestNotification extends Notification
{
    use Queueable;

    protected $task;
    protected $assignedBy;
    protected $requestId;

    public function __construct($task, $assignedBy, $requestId)
    {
        $this->task = $task;
        $this->assignedBy = $assignedBy;
        $this->requestId = $requestId;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        return [

            'type' => 'task_assignment',

            'request_id' => $this->requestId,

            'task_id' => $this->task->id,
            'task_title' => $this->task->title,

            'assigned_by_id' => $this->assignedBy->id,
            'assigned_by_name' => $this->assignedBy->name

        ];
    }
}
