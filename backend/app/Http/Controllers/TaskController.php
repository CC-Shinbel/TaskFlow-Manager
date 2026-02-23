<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Task::query();

        // Role-based visibility
        if (!$user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        // Search (title + description)
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                    ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Priority filter
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        // Sorting
        $sortDirection = $request->get('sort', 'asc');
        if (in_array($sortDirection, ['asc', 'desc'])) {
            $query->orderBy('due_date', $sortDirection);
        }

        $tasks = $query->paginate(10);

        return response()->json([
            'status'  => true,
            'message' => 'Tasks retrieved',
            'data'    => $tasks
        ]);
    }

    public function store(StoreTaskRequest $request)
    {
        $user = $request->user();

        $task = Task::create([
            ...$request->validated(),
            'user_id' => $user->id,
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Task created',
            'data'    => $task
        ], 201);
    }

    public function show(Request $request, Task $task)
    {
        $this->authorizeTaskAccess($request->user(), $task);

        return response()->json([
            'status'  => true,
            'message' => 'Task retrieved',
            'data'    => $task
        ]);
    }

    public function update(UpdateTaskRequest $request, Task $task)
    {
        $this->authorizeTaskAccess($request->user(), $task);

        $task->update($request->validated());

        return response()->json([
            'status'  => true,
            'message' => 'Task updated',
            'data'    => $task
        ]);
    }

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

    private function authorizeTaskAccess($user, Task $task)
    {
        if (!$user->isAdmin() && $task->user_id !== $user->id) {
            abort(403, 'Unauthorized');
        }
    }
}
