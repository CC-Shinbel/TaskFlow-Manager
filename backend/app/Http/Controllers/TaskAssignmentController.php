<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use App\Notifications\TaskAssignedNotification;

class TaskAssignmentController extends Controller
{
    /**
     * Assign user to task
     */
    public function store(Request $request, Task $task)
    {
        $user = $request->user();

        $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        $this->authorizeAssignment($user, $task);

        if ($task->assignees()->where('users.id', $request->user_id)->exists()) {
            return response()->json([
                'status' => false,
                'message' => 'User already assigned'
            ], 422);
        }

        $task->assignees()->attach($request->user_id, [
            'assigned_by' => $user->id
        ]);

        $assignedUser = User::findOrFail($request->user_id);

        if ($assignedUser->id !== $user->id) {
            $assignedUser->notify(
                new TaskAssignedNotification($task, $user)
            );
        }

        return response()->json([
            'status' => true,
            'message' => 'User assigned to task'
        ]);
    }

    /**
     * Remove user from task
     */
    public function destroy(Request $request, Task $task, User $userToRemove)
    {
        $user = $request->user();

        if ($user->id !== $userToRemove->id) {
            $this->authorizeAssignment($user, $task);
        }

        if (is_null($task->project_id) && $task->created_by === $userToRemove->id) {
            abort(403, 'Cannot remove creator from personal task.');
        }

        $task->assignees()->detach($userToRemove->id);

        return response()->json([
            'status' => true,
            'message' => 'User removed from task'
        ]);
    }

    /**
     * Authorization
     */
    private function authorizeAssignment($user, Task $task)
    {
        if (is_null($task->project_id)) {

            if ($task->created_by !== $user->id) {
                abort(403, 'Only creator can assign users.');
            }

            return;
        }

        $role = $task->project
            ->users()
            ->where('project_user.user_id', $user->id)
            ->value('project_user.role');

        if (!in_array($role, ['owner', 'co_owner', 'collaborator'])) {
            abort(403, 'Insufficient project permissions.');
        }
    }
}
