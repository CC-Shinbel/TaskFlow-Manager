<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use App\Models\TaskAssignmentRequest;
use Illuminate\Http\Request;
use App\Notifications\TaskAssignmentRequestNotification;
use Illuminate\Support\Facades\Gate;

class TaskAssignmentController extends Controller
{
    /**
     * =========================
     * SEND TASK ASSIGNMENT REQUEST
     * =========================
     */
    public function store(Request $request, $taskId)
    {
        $user = $request->user();

        $task = Task::findOrFail($taskId);
        // 🔒 POLICY
        Gate::authorize('assign-task', $task);

        $user = $request->user();

        $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        $targetUser = User::findOrFail($request->user_id);

        /*
        |--------------------------------------------------------------------------
        | Prevent duplicate assignment
        |--------------------------------------------------------------------------
        */
        if ($task->assignees()->where('users.id', $targetUser->id)->exists()) {
            return response()->json([
                'status' => false,
                'message' => 'User already assigned'
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Prevent duplicate request
        |--------------------------------------------------------------------------
        */
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

        /*
        |--------------------------------------------------------------------------
        | Create assignment request
        |--------------------------------------------------------------------------
        */
        $assignmentRequest = TaskAssignmentRequest::create([
            'task_id' => $task->id,
            'user_id' => $targetUser->id,
            'assigned_by' => $user->id,
            'status' => 'pending'
        ]);

        /*
        |--------------------------------------------------------------------------
        | Send notification
        |--------------------------------------------------------------------------
        */
        $targetUser->notify(
            new TaskAssignmentRequestNotification(
                $task,
                $user,
                $assignmentRequest->id
            )
        );

        return response()->json([
            'status' => true,
            'message' => 'Assignment request sent'
        ]);
    }

    /**
     * =========================
     * ACCEPT ASSIGNMENT
     * =========================
     */
    public function accept(Request $request, TaskAssignmentRequest $assignment)
    {
        // 🔒 POLICY
        $this->authorize('accept', $assignment);

        // Prevent double processing
        if ($assignment->status !== 'pending') {
            return response()->json([
                'status' => false,
                'message' => 'Assignment already processed'
            ], 400);
        }

        $task = Task::findOrFail($assignment->task_id);

        /*
        |--------------------------------------------------------------------------
        | Assign user to task (avoid duplicate)
        |--------------------------------------------------------------------------
        */
        if (!$task->assignees()->where('users.id', $assignment->user_id)->exists()) {
            $task->assignees()->attach($assignment->user_id, [
                'assigned_by' => $assignment->assigned_by
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Remove request
        |--------------------------------------------------------------------------
        */
        $assignment->delete();

        return response()->json([
            'status' => true,
            'message' => 'Task assignment accepted'
        ]);
    }

    /**
     * =========================
     * DECLINE ASSIGNMENT
     * =========================
     */
    public function decline(Request $request, TaskAssignmentRequest $assignment)
    {
        // 🔒 POLICY
        $this->authorize('decline', $assignment);

        if ($assignment->status !== 'pending') {
            return response()->json([
                'status' => false,
                'message' => 'Assignment already processed'
            ], 400);
        }

        $assignment->delete();

        return response()->json([
            'status' => true,
            'message' => 'Task assignment declined'
        ]);
    }

    /**
     * =========================
     * REMOVE USER FROM TASK
     * =========================
     */
    public function destroy(Request $request, Task $task, User $userToRemove)
    {
        // 🔒 POLICY (self OR manager)
        $this->authorize('remove', [$task, $userToRemove]);

        /*
        |--------------------------------------------------------------------------
        | Prevent removing creator from personal task
        |--------------------------------------------------------------------------
        */
        if (is_null($task->project_id) && $task->created_by === $userToRemove->id) {
            abort(403, 'Cannot remove creator from personal task.');
        }

        $task->assignees()->detach($userToRemove->id);

        return response()->json([
            'status' => true,
            'message' => 'User removed from task'
        ]);
    }
}
