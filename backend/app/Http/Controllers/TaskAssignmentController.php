<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use App\Models\TaskAssignmentRequest;
use Illuminate\Http\Request;
use App\Notifications\TaskAssignmentRequestNotification;

class TaskAssignmentController extends Controller
{

    /**
     * Send task assignment request
     */
    public function store(Request $request, Task $task)
    {
        $user = $request->user();

        $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        $this->authorizeAssignment($user, $task);

        $targetUser = User::findOrFail($request->user_id);

        // Prevent duplicate assignment
        if ($task->assignees()->where('users.id', $targetUser->id)->exists()) {
            return response()->json([
                'status' => false,
                'message' => 'User already assigned'
            ], 422);
        }

        // Prevent duplicate request
        $existingRequest = TaskAssignmentRequest::where([
            'task_id' => $task->id,
            'user_id' => $targetUser->id
        ])->first();

        if ($existingRequest) {
            return response()->json([
                'status' => false,
                'message' => 'Assignment request already exists'
            ], 422);
        }

        // Create assignment request
        TaskAssignmentRequest::create([
            'task_id' => $task->id,
            'user_id' => $targetUser->id,
            'assigned_by' => $user->id
        ]);

        // Send notification
        $targetUser->notify(
            new TaskAssignmentRequestNotification($task, $user)
        );

        return response()->json([
            'status' => true,
            'message' => 'Assignment request sent'
        ]);
    }

    /**
     * Accept assignment
     */
    public function accept(Request $request, TaskAssignmentRequest $assignment)
    {
        $user = $request->user();

        if ($assignment->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $task = Task::findOrFail($assignment->task_id);

        $task->assignees()->attach($user->id, [
            'assigned_by' => $assignment->assigned_by
        ]);

        $assignment->delete();

        return response()->json([
            'status' => true,
            'message' => 'Task assignment accepted'
        ]);
    }

    /**
     * Decline assignment
     */
    public function decline(Request $request, TaskAssignmentRequest $assignment)
    {
        $user = $request->user();

        if ($assignment->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $assignment->delete();

        return response()->json([
            'status' => true,
            'message' => 'Task assignment declined'
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
     * Authorization logic
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
