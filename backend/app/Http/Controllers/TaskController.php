<?php

namespace App\Http\Controllers;

use App\Models\Task;
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

        // ADMIN → see all tasks
        if ($user->isAdmin()) {
            $query = Task::query();
        } else {
            $query = Task::where(function ($query) use ($user) {

                // Personal tasks
                $query->whereNull('project_id')
                    ->where('created_by', $user->id);

                // Project tasks
                $query->orWhereHas('project.users', function ($q) use ($user) {
                    $q->where('project_user.user_id', $user->id);
                });
            });
        }

        // =========================
        // FILTERS
        // =========================

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('assignee_id')) {
            $query->whereHas('assignees', function ($q) use ($request) {
                $q->where('users.id', $request->assignee_id);
            });
        }

        if ($request->filled('due_date')) {
            $query->whereDate('due_date', $request->due_date);
        }

        // =========================
        // SORTING
        // =========================
        if ($request->filled('sort_by')) {
            $direction = $request->get('direction', 'asc');
            $query->orderBy($request->sort_by, $direction);
        } else {
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
            ->through(fn($task) => $this->formatTask($task));

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

        // ✅ POLICY CHECK
        $this->authorize('create', [Task::class, $data['project_id'] ?? null]);

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
        // ✅ POLICY CHECK
        $this->authorize('view', $task);

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
        // ✅ POLICY CHECK
        $this->authorize('update', $task);

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
        // ✅ POLICY CHECK
        $this->authorize('delete', $task);

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
}
