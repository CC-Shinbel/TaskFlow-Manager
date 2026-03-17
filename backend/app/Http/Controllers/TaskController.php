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

            $query->whereNull('project_id')
                ->where('created_by', $user->id);

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
            ->paginate(10);

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
            'data' => $task->load('assignees:id,name')
        ], 201);
    }

    /**
     * Show single task
     */
    public function show(Request $request, Task $task)
    {
        $this->authorizeTaskAccess($request->user(), $task);

        return response()->json([
            'status' => true,
            'message' => 'Task retrieved',
            'data' => $task->load([
                'project:id,name',
                'creator:id,name',
                'assignees:id,name'
            ])
        ]);
    }

    /**
     * ✅ FIXED UPDATE (PARTIAL PAYLOAD SUPPORT)
     */
    public function update(Request $request, Task $task)
    {
        $this->authorizeTaskAccess($request->user(), $task);

        // ✅ Partial validation
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'status' => 'sometimes|in:pending,in_progress,completed',
            'priority' => 'sometimes|in:low,medium,high',
            'due_date' => 'sometimes|nullable|date',
        ]);

        // ✅ Only update provided fields
        $task->update($validated);

        return response()->json([
            'status' => true,
            'message' => 'Task updated',
            'data' => $task->load([
                'project:id,name',
                'creator:id,name',
                'assignees:id,name'
            ])
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
