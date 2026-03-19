<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;
use App\Http\Requests\StoreTaskRequest;

class TaskController extends Controller
{
    /**
     * =========================
     * LIST TASKS (WITH FILTERS)
     * =========================
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

        // =========================
        // FILTERS
        // =========================

        // Project filter
        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        // Search (title)
        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Priority
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        // Assignee
        if ($request->filled('assignee_id')) {
            $query->whereHas('assignees', function ($q) use ($request) {
                $q->where('users.id', $request->assignee_id);
            });
        }

        // Due date (exact date match)
        if ($request->filled('due_date')) {
            $query->whereDate('due_date', $request->due_date);
        }

        // =========================
        // SORTING (OPTIONAL)
        // =========================
        if ($request->filled('sort_by')) {
            $direction = $request->get('direction', 'asc');
            $query->orderBy($request->sort_by, $direction);
        } else {
            // Default sorting (latest first)
            $query->latest();
        }

        // =========================
        // PAGINATION
        // =========================
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
     * =========================
     * CREATE TASK
     * =========================
     */
    public function store(StoreTaskRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();

        // Project permission check
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
     * =========================
     * SHOW TASK
     * =========================
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
     * =========================
     * UPDATE TASK
     * =========================
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
     * =========================
     * DELETE TASK
     * =========================
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
     * =========================
     * FORMAT TASK
     * =========================
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

            'project_id' => $task->project_id,

            'project' => $task->project,
            'creator' => $task->creator,
            'assignees' => $task->assignees,
        ];
    }

    /**
     * =========================
     * AUTHORIZATION
     * =========================
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
