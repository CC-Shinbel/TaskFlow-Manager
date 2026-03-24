<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    /**
     * User can view project if member
     */
    public function view(User $user, Project $project): bool
    {
        return $project->users()
            ->where('user_id', $user->id)
            ->exists();
    }

    /**
     * Any authenticated user can create project
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Only owner can delete
     */
    public function delete(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id;
    }

    /**
     * Invite users (collaborator and above)
     */
    public function invite(User $user, Project $project): bool
    {
        $role = $project->users()
            ->where('user_id', $user->id)
            ->value('project_user.role');

        return in_array($role, ['owner', 'co_owner', 'collaborator']);
    }

    /**
     * Change roles (owner & co_owner only)
     */
    public function changeRole(User $user, Project $project): bool
    {
        $role = $project->users()
            ->where('user_id', $user->id)
            ->value('project_user.role');

        return in_array($role, ['owner', 'co_owner']);
    }

    /**
     * Remove users (owner & co_owner only)
     */
    public function removeUser(User $user, Project $project): bool
    {
        $role = $project->users()
            ->where('user_id', $user->id)
            ->value('project_user.role');

        return in_array($role, ['owner', 'co_owner']);
    }
}
