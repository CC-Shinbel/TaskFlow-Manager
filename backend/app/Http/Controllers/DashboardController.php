<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Task::query();

        if (!$user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

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

        return response()->json([
            'status'  => true,
            'message' => 'Dashboard data retrieved',
            'data'    => [
                'total_tasks' => $total,
                'completed'   => $completed,
                'pending'     => $pending,
                'overdue'     => $overdue,
            ]
        ]);
    }
}