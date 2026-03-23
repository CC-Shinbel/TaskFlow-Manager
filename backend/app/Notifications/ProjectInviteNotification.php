<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ProjectInviteNotification extends Notification
{
    use Queueable;

    protected $project;
    protected $invitedBy;
    protected $invite;

    public function __construct($project, $invitedBy, $invite)
    {
        $this->project = $project;
        $this->invitedBy = $invitedBy;
        $this->invite = $invite;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'type' => 'project_invite',

            'invite_id' => $this->invite->id,

            'project_id' => $this->project->id,
            'project_name' => $this->project->name,

            'invited_by_id' => $this->invitedBy->id,
            'invited_by_name' => $this->invitedBy->name
        ];
    }
}
