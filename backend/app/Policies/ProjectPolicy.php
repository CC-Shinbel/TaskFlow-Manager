<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    /**
     * Resolve the current user's role in the project.
     * Returns null if the user is not a member.
     */
    private function getRole(User $user, Project $project): ?string
    {
        return $project->users()
            ->where('user_id', $user->id)
            ->value('project_user.role');
    }

    /**
     * User can view project if they are a member (any role).
     */
    public function view(User $user, Project $project): bool
    {
        return $this->getRole($user, $project) !== null;
    }

    /**
     * Any authenticated user can create a project.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Only owner and co_owner can edit project details.
     */
    public function update(User $user, Project $project): bool
    {
        return in_array($this->getRole($user, $project), ['owner', 'co_owner']);
    }

    /**
     * Only the owner can delete the project.
     */
    public function delete(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id;
    }

    /**
     * Collaborators and above can invite users.
     */
    public function invite(User $user, Project $project): bool
    {
        return in_array($this->getRole($user, $project), ['owner', 'co_owner', 'collaborator']);
    }

    /**
     * Only owner and co_owner can change member roles.
     */
    public function changeRole(User $user, Project $project): bool
    {
        return in_array($this->getRole($user, $project), ['owner', 'co_owner']);
    }

    /**
     * Only owner and co_owner can remove members.
     */
    public function removeUser(User $user, Project $project): bool
    {
        return in_array($this->getRole($user, $project), ['owner', 'co_owner']);
    }
}
