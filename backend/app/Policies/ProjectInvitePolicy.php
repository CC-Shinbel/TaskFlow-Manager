<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ProjectInvite;

class ProjectInvitePolicy
{
    /**
     * Accept invite → ONLY invited user
     */
    public function accept(User $user, ProjectInvite $invite): bool
    {
        return $invite->user_id === $user->id;
    }

    /**
     * Decline invite → ONLY invited user
     */
    public function decline(User $user, ProjectInvite $invite): bool
    {
        return $invite->user_id === $user->id;
    }
}
