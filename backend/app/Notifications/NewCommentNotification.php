<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewCommentNotification extends Notification
{
    use Queueable;

    protected $comment;

    public function __construct($comment)
    {
        $this->comment = $comment;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'new_comment',
            'comment_id' => $this->comment->id,
            'project_id' => $this->comment->project_id,
            'task_id' => $this->comment->task_id,
            'content' => $this->comment->content,
            'user_name' => $this->comment->user->name
        ];
    }
}
