<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;
use App\Http\Requests\StoreTaskRequest;

class TaskController extends Controller
{
    /**
     * List all tasks user has access to
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Task::where(function ($query) use ($user) {

            // Personal tasks
            $query->whereNull('project_id')
                ->where('created_by', $user->id);

            // Project tasks
            $query->orWhereHas('project.users', function ($q) use ($user) {
                $q->where('project_user.user_id', $user->id);
            });
        });

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('sort_by')) {
            $direction = $request->get('direction', 'asc');
            $query->orderBy($request->sort_by, $direction);
        }

        $tasks = $query
            ->with([
                'project:id,name',
                'creator:id,name',
                'assignees:id,name'
            ])
            ->paginate(10)
            ->through(function ($task) {
                return $this->formatTask($task);
            });

        return response()->json([
            'status' => true,
            'message' => 'Tasks retrieved',
            'data' => $tasks
        ]);
    }

    /**
     * Create task
     */
    public function store(StoreTaskRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();

        // If project task → enforce permission
        if (!empty($data['project_id'])) {

            $project = Project::findOrFail($data['project_id']);

            $role = $project->users()
                ->where('project_user.user_id', $user->id)
                ->value('project_user.role');

            if (!in_array($role, ['owner', 'co_owner', 'collaborator'])) {
                abort(403, 'Not allowed to create tasks in this project.');
            }
        }

        $task = Task::create([
            'project_id' => $data['project_id'] ?? null,
            'created_by' => $user->id,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'status' => $data['status'] ?? 'pending',
            'priority' => $data['priority'] ?? 'medium',
            'due_date' => $data['due_date'] ?? null,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Task created',
            'data' => $this->formatTask(
                $task->load('project:id,name', 'creator:id,name', 'assignees:id,name')
            )
        ], 201);
    }

    /**
     * Show single task
     */
    public function show(Request $request, Task $task)
    {
        $this->authorizeTaskAccess($request->user(), $task);

        $task->load([
            'project:id,name',
            'creator:id,name',
            'assignees:id,name'
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Task retrieved',
            'data' => $this->formatTask($task)
        ]);
    }

    /**
     * Update task (Partial payload)
     */
    public function update(Request $request, Task $task)
    {
        $this->authorizeTaskAccess($request->user(), $task);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'status' => 'sometimes|in:pending,in_progress,completed',
            'priority' => 'sometimes|in:low,medium,high',
            'due_date' => 'sometimes|nullable|date',
        ]);

        $task->update($validated);

        return response()->json([
            'status' => true,
            'message' => 'Task updated',
            'data' => $this->formatTask(
                $task->load('project:id,name', 'creator:id,name', 'assignees:id,name')
            )
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
            'status' => true,
            'message' => 'Task deleted',
            'data' => []
        ]);
    }

    /**
     * Format task (STANDARDIZED RESPONSE)
     */
    private function formatTask($task)
    {
        return [
            'id' => $task->id,
            'title' => $task->title,
            'description' => $task->description,
            'status' => $task->status,
            'priority' => $task->priority,
            'due_date' => $task->due_date,
            'created_at' => $task->created_at,
            'updated_at' => $task->updated_at,

            // ✅ CRITICAL FOR OPTION A
            'project_id' => $task->project_id,

            // Relations
            'project' => $task->project,
            'creator' => $task->creator,
            'assignees' => $task->assignees,
        ];
    }

    /**
     * Access control
     */
    private function authorizeTaskAccess($user, Task $task)
    {
        if (is_null($task->project_id)) {

            if ($task->created_by !== $user->id) {
                abort(403, 'Unauthorized personal task access.');
            }

            return;
        }

        $isMember = $task->project
            ->users()
            ->where('project_user.user_id', $user->id)
            ->exists();

        if (!$isMember) {
            abort(403, 'Unauthorized project task access.');
        }
    }
}
