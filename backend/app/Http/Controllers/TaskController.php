<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;

class TaskController extends Controller
{
    /**
     * List all tasks user has access to
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $tasks = Task::where(function ($query) use ($user) {

            // Personal tasks
            $query->whereNull('project_id')
                ->where('created_by', $user->id);

            // OR project tasks where user is member
            $query->orWhereHas('project.users', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        })
            ->with([
                'project:id,name',
                'creator:id,name',
                'assignees:id,name'
            ])
            ->paginate(10);

        return response()->json([
            'status'  => true,
            'message' => 'Tasks retrieved',
            'data'    => $tasks
        ]);
    }

    /**
     * Create task (personal or project)
     */
    public function store(StoreTaskRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();

        // If project task → enforce project permission
        if (!empty($data['project_id'])) {

            $project = Project::findOrFail($data['project_id']);

            $role = $project->users()
                ->where('user_id', $user->id)
                ->value('role');

            if (!in_array($role, ['owner', 'co_owner', 'collaborator'])) {
                abort(403, 'Not allowed to create tasks in this project.');
            }
        }

        $task = Task::create([
            'project_id' => $data['project_id'] ?? null,
            'created_by' => $user->id,
            'title'      => $data['title'],
            'description' => $data['description'] ?? null,
            'status'     => $data['status'] ?? 'pending',
            'priority'   => $data['priority'] ?? 'medium',
            'due_date'   => $data['due_date'] ?? null,
        ]);

        // Automatically assign creator
        $task->assignees()->attach($user->id, [
            'assigned_by' => $user->id
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Task created',
            'data'    => $task->load('assignees:id,name')
        ], 201);
    }

    /**
     * Show single task
     */
    public function show(Request $request, Task $task)
    {
        $this->authorizeTaskAccess($request->user(), $task);

        return response()->json([
            'status'  => true,
            'message' => 'Task retrieved',
            'data'    => $task->load([
                'project:id,name',
                'creator:id,name',
                'assignees:id,name'
            ])
        ]);
    }

    /**
     * Update task
     */
    public function update(UpdateTaskRequest $request, Task $task)
    {
        $this->authorizeTaskAccess($request->user(), $task);

        $task->update($request->validated());

        return response()->json([
            'status'  => true,
            'message' => 'Task updated',
            'data'    => $task->load('assignees:id,name')
        ]);
    }

    /**
     * Delete task
     */
    public function destroy(Request $request, Task $task)
    {
        $this->authorizeTaskAccess($request->user(), $task);

        $task->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Task deleted',
            'data'    => []
        ]);
    }

    /**
     * Core task access control
     */
    private function authorizeTaskAccess($user, Task $task)
    {
        // Personal task
        if (is_null($task->project_id)) {
            if ($task->created_by !== $user->id) {
                abort(403, 'Unauthorized personal task access.');
            }
            return;
        }

        // Project task → user must belong to project
        $isMember = $task->project
            ->users()
            ->where('user_id', $user->id)
            ->exists();

        if (!$isMember) {
            abort(403, 'Unauthorized project task access.');
        }
    }
}
