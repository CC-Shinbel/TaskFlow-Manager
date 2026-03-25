<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Task;
use App\Models\TaskAssignmentRequest;

class TaskAssignmentPolicy
{
    /**
     * Send assignment request
     */
    public function assign(User $user, Task $task): bool
    {

        // Personal task
        if (is_null($task->project_id)) {
            return $task->created_by === $user->id;
        }

        $role = $task->project
            ->users()
            ->where('users.id', $user->id)
            ->first()?->pivot?->role;

        if (!$role) return false;

        return in_array($role, ['owner', 'co_owner', 'collaborator']);
    }

    /**
     * Accept assignment → ONLY target user
     */
    public function accept(User $user, TaskAssignmentRequest $assignment): bool
    {
        return $assignment->user_id === $user->id;
    }

    /**
     * Decline assignment → ONLY target user
     */
    public function decline(User $user, TaskAssignmentRequest $assignment): bool
    {
        return $assignment->user_id === $user->id;
    }

    /**
     * Remove assignment
     */
    public function remove(User $user, Task $task, User $targetUser): bool
    {
        // ✅ Self-removal always allowed
        if ($user->id === $targetUser->id) {
            return true;
        }

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
            ->where('users.id', $user->id) // ✅ FIXED
            ->value('project_user.role');

        if (!$role) return false;

        return in_array($role, ['owner', 'co_owner', 'collaborator']);
    }
}
