<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use App\Notifications\NewCommentNotification;

class CommentController extends Controller
{
    /**
     * List comments
     */
    public function index(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'task_id' => 'nullable|exists:tasks,id'
        ]);

        $user = $request->user();

        $project = Project::findOrFail($request->project_id);

        $this->authorizeProjectMembership($user, $project);

        $comments = Comment::where('project_id', $project->id)
            ->when($request->task_id, function ($query) use ($request) {
                $query->where('task_id', $request->task_id);
            })
            ->with('user:id,name')
            ->latest()
            ->get();

        return response()->json([
            'status' => true,
            'message' => 'Comments retrieved',
            'data' => $comments
        ]);
    }

    /**
     * Create comment
     */
    public function store(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'task_id' => 'nullable|exists:tasks,id',
            'content' => 'required|string'
        ]);

        $user = $request->user();

        $project = Project::findOrFail($request->project_id);

        $this->authorizeProjectMembership($user, $project);

        $task = null;

        if ($request->task_id) {

            $task = Task::findOrFail($request->task_id);

            if ($task->project_id !== $project->id) {
                abort(403, 'Task does not belong to this project.');
            }
        }

        $comment = Comment::create([
            'project_id' => $project->id,
            'task_id' => $request->task_id,
            'user_id' => $user->id,
            'content' => $request->content
        ]);

        /*
        |--------------------------------------------------------------------------
        | NOTIFICATIONS
        |--------------------------------------------------------------------------
        */

        $notifiedUsers = collect();

        /**
         * Notify task assignees
         */
        if ($task) {

            $task->load('assignees');

            foreach ($task->assignees as $assignee) {

                if (!$notifiedUsers->contains($assignee->id)) {

                    $assignee->notify(
                        new NewCommentNotification($comment)
                    );

                    $notifiedUsers->push($assignee->id);
                }
            }
        }

        /**
         * Notify project managers
         */
        $managers = $project->users()
            ->wherePivotIn('role', ['owner', 'co_owner', 'collaborator'])
            ->get();

        foreach ($managers as $manager) {

            if (!$notifiedUsers->contains($manager->id)) {

                $manager->notify(
                    new NewCommentNotification($comment)
                );

                $notifiedUsers->push($manager->id);
            }
        }

        return response()->json([
            'status' => true,
            'message' => 'Comment created',
            'data' => $comment->load('user:id,name')
        ], 201);
    }

    /**
     * Delete comment
     */
    public function destroy(Request $request, Comment $comment)
    {
        $user = $request->user();

        $project = $comment->project;

        $membership = $project->users()
            ->where('user_id', $user->id)
            ->first();

        if (!$membership) {
            abort(403, 'Unauthorized project access.');
        }

        $role = $membership->pivot->role;

        if (
            $comment->user_id === $user->id ||
            in_array($role, ['owner', 'co_owner'])
        ) {

            $comment->delete();

            return response()->json([
                'status' => true,
                'message' => 'Comment deleted'
            ]);
        }

        abort(403, 'Unauthorized to delete this comment.');
    }

    /**
     * Ensure membership
     */
    private function authorizeProjectMembership($user, $project)
    {
        if (!$project->users()->where('user_id', $user->id)->exists()) {
            abort(403, 'Unauthorized project access.');
        }
    }
}
