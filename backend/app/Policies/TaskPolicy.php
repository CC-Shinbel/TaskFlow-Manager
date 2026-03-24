<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;
use App\Models\Project;

class TaskPolicy
{
    /**
     * VIEW ANY TASKS
     */
    public function viewAny(User $user): bool
    {
        return true; // handled by query filtering
    }

    /**
     * VIEW SINGLE TASK
     */
    public function view(User $user, Task $task): bool
    {
        // Personal task
        if (is_null($task->project_id)) {
            return $task->created_by === $user->id;
        }

        // Project task → must be a member
        return $task->project
            ->users()
            ->where('project_user.user_id', $user->id)
            ->exists();
    }

    /**
     * CREATE TASK
     */
    public function create(User $user, ?int $projectId = null): bool
    {
        // Personal task → allowed
        if (!$projectId) return true;

        $project = Project::find($projectId);

        if (!$project) return false;

        $role = $project->users()
            ->where('project_user.user_id', $user->id)
            ->value('project_user.role');

        return in_array($role, ['owner', 'co_owner', 'collaborator']);
    }

    /**
     * UPDATE TASK
     */
    public function update(User $user, Task $task): bool
    {
        // =========================
        // PERSONAL TASK
        // =========================
        if (is_null($task->project_id)) {
            return $task->created_by === $user->id;
        }

        // =========================
        // PROJECT TASK
        // =========================
        $role = $task->project
            ->users()
            ->where('project_user.user_id', $user->id)
            ->value('project_user.role');

        if (!$role) return false;

        // Owner / Co-owner → full access
        if (in_array($role, ['owner', 'co_owner'])) {
            return true;
        }

        // Collaborator → can update
        if ($role === 'collaborator') {
            return true;
        }

        // Member → ONLY if assigned
        if ($role === 'member') {
            return $task->assignees()
                ->where('users.id', $user->id)
                ->exists();
        }

        return false;
    }

    /**
     * DELETE TASK
     */
    public function delete(User $user, Task $task): bool
    {
        // Personal task
        if (is_null($task->project_id)) {
            return $task->created_by === $user->id;
        }

        $role = $task->project
            ->users()
            ->where('project_user.user_id', $user->id)
            ->value('project_user.role');

        return in_array($role, ['owner', 'co_owner']);
    }

    /**
     * RESTORE (not used)
     */
    public function restore(User $user, Task $task): bool
    {
        return false;
    }

    /**
     * FORCE DELETE (not used)
     */
    public function forceDelete(User $user, Task $task): bool
    {
        return false;
    }
}
