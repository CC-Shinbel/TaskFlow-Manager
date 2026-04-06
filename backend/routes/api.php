<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectInviteController;
use App\Http\Controllers\TaskAssignmentController;
use App\Http\Controllers\CommentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    /*
    |--------------------------------------------------------------------------
    | Projects
    |--------------------------------------------------------------------------
    */

    Route::apiResource('projects', ProjectController::class)
        ->only(['index', 'store', 'show', 'destroy']);

    Route::post('/projects/{project}/invite', [ProjectController::class, 'inviteUser']);

    Route::put('/projects/{project}/members/{user}/role', [ProjectController::class, 'changeRole']);

    Route::patch('/projects/{project}', [ProjectController::class, 'update']);

    Route::delete('/projects/{project}/members/{user}', [ProjectController::class, 'removeUser']);

    /*
    |--------------------------------------------------------------------------
    | Project Invites
    |--------------------------------------------------------------------------
    */

    Route::post('/project-invites/{invite}/accept', [ProjectInviteController::class, 'accept']);
    Route::post('/project-invites/{invite}/decline', [ProjectInviteController::class, 'decline']);

    /*
    |--------------------------------------------------------------------------
    | Tasks
    |--------------------------------------------------------------------------
    */

    Route::apiResource('tasks', TaskController::class);

    /*
    |--------------------------------------------------------------------------
    | Task Assignments
    |--------------------------------------------------------------------------
    */

    Route::post('/tasks/{task}/assign', [TaskAssignmentController::class, 'store']);

    Route::post('/task-assignments/{assignment}/accept', [TaskAssignmentController::class, 'accept']);
    Route::post('/task-assignments/{assignment}/decline', [TaskAssignmentController::class, 'decline']);

    Route::delete('/tasks/{task}/assign/{user}', [TaskAssignmentController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | Comments
    |--------------------------------------------------------------------------
    */

    Route::get('/comments', [CommentController::class, 'index']);
    Route::post('/comments', [CommentController::class, 'store']);
    Route::put('/comments/{comment}', [CommentController::class, 'update']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | Notifications
    |--------------------------------------------------------------------------
    */

    Route::get('/notifications', function (Request $request) {

        $query = $request->user()
            ->notifications()
            ->orderBy('created_at', 'desc');

        if ($request->has('after')) {
            $query->where('created_at', '>', $request->after);
        }

        return $query->limit(20)->get();
    });
    Route::post('/notifications/{id}/read', function (Request $request, $id) {

        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);

        $notification->markAsRead();

        return response()->json([
            'status' => true
        ]);
    });

    Route::delete('/notifications/{id}', function (Request $request, $id) {

        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);

        $notification->delete();

        return response()->json([
            'status' => true
        ]);
    });

    /*
    |--------------------------------------------------------------------------
    | Current User
    |--------------------------------------------------------------------------
    */

    Route::get('/user', [AuthController::class, 'me']);
});


Route::get('/health', function () {
    return response()->json([
        'status' => true,
        'message' => 'API is working'
    ]);
});
