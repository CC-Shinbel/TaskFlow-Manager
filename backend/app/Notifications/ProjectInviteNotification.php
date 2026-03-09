<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ProjectInviteNotification extends Notification
{
    use Queueable;

    protected $project;
    protected $invitedBy;

    /**
     * Create a new notification instance.
     */
    public function __construct($project, $invitedBy)
    {
        $this->project = $project;
        $this->invitedBy = $invitedBy;
    }

    /**
     * Notification channels
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

            'type' => 'project_invite',

            'project_id' => $this->project->id,
            'project_name' => $this->project->name,

            'invited_by_id' => $this->invitedBy->id,
            'invited_by_name' => $this->invitedBy->name

        ];
    }
}
