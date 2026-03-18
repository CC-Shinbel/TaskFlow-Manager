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
     * =========================
     * LIST COMMENTS
     * =========================
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'task_id' => 'nullable|exists:tasks,id'
        ]);

        $user = $request->user();

        $project = Project::findOrFail($validated['project_id']);
        $this->authorizeProjectMembership($user, $project);

        $comments = Comment::where('project_id', $project->id)
            ->when($validated['task_id'] ?? null, function ($query, $taskId) {
                $query->where('task_id', $taskId);
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
     * =========================
     * CREATE COMMENT
     * =========================
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'task_id' => 'nullable|exists:tasks,id',
            'content' => 'required|string'
        ]);

        $user = $request->user();

        $project = Project::findOrFail($validated['project_id']);
        $this->authorizeProjectMembership($user, $project);

        $task = null;

        // Validate task belongs to project
        if (!empty($validated['task_id'])) {

            $task = Task::findOrFail($validated['task_id']);

            if ($task->project_id !== $project->id) {
                abort(403, 'Task does not belong to this project.');
            }
        }

        $comment = Comment::create([
            'project_id' => $project->id,
            'task_id' => $validated['task_id'] ?? null,
            'user_id' => $user->id,
            'content' => $validated['content']
        ]);

        // =========================
        // NOTIFICATIONS
        // =========================
        $this->sendNotifications($project, $task, $comment);

        return response()->json([
            'status' => true,
            'message' => 'Comment created',
            'data' => $comment->load('user:id,name')
        ], 201);
    }

    /**
     * =========================
     * UPDATE COMMENT
     * =========================
     */
    public function update(Request $request, Comment $comment)
    {
        $validated = $request->validate([
            'content' => 'required|string'
        ]);

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

            $comment->update([
                'content' => $validated['content']
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Comment updated',
                'data' => $comment->load('user:id,name')
            ]);
        }

        abort(403, 'Unauthorized to edit this comment.');
    }

    /**
     * =========================
     * DELETE COMMENT
     * =========================
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
     * =========================
     * SEND NOTIFICATIONS
     * =========================
     */
    private function sendNotifications($project, $task, $comment)
    {
        $notifiedUsers = collect();

        // Task assignees
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

        // Project managers
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
    }

    /**
     * =========================
     * AUTHORIZATION
     * =========================
     */
    private function authorizeProjectMembership($user, $project)
    {
        if (!$project->users()->where('user_id', $user->id)->exists()) {
            abort(403, 'Unauthorized project access.');
        }
    }
}
