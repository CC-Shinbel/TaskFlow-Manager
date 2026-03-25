<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | BASE QUERY (same logic as TaskController)
        |--------------------------------------------------------------------------
        */
        $query = Task::query();

        if (!$user->isAdmin()) {
            $query->where(function ($q) use ($user) {

                // Personal tasks
                $q->whereNull('project_id')
                    ->where('created_by', $user->id);

                // Project tasks
                $q->orWhereHas('project.users', function ($sub) use ($user) {
                    $sub->where('project_user.user_id', $user->id);
                });
            });
        }

        /*
        |--------------------------------------------------------------------------
        | STATS
        |--------------------------------------------------------------------------
        */
        $total = (clone $query)->count();

        $completed = (clone $query)
            ->where('status', 'completed')
            ->count();

        $pending = (clone $query)
            ->where('status', 'pending')
            ->count();

        $overdue = (clone $query)
            ->where('due_date', '<', now())
            ->where('status', '!=', 'completed')
            ->count();

        /*
        |--------------------------------------------------------------------------
        | RECENT TASKS (🔥 NEW)
        |--------------------------------------------------------------------------
        */
        $recentTasks = (clone $query)
            ->with([
                'project:id,name',
                'creator:id,name',
                'assignees:id,name'
            ])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($task) {
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
            });

        return response()->json([
            'status'  => true,
            'message' => 'Dashboard data retrieved',
            'data'    => [
                'total_tasks' => $total,
                'completed'   => $completed,
                'pending'     => $pending,
                'overdue'     => $overdue,
                'recent_tasks' => $recentTasks // ✅ NEW
            ]
        ]);
    }
}
