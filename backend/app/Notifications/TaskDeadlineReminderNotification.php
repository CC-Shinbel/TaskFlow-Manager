<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TaskDeadlineReminderNotification extends Notification
{
    use Queueable;

    protected $task;

    public function __construct($task)
    {
        $this->task = $task;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        return [

            'type' => 'task_deadline_reminder',

            'task_id' => $this->task->id,
            'task_title' => $this->task->title,

            'due_date' => $this->task->due_date

        ];
    }
}
