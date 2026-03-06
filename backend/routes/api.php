<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectMemberController;
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
    Route::delete('/projects/{project}/members/{user}', [ProjectController::class, 'removeUser']);

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
    Route::delete('/tasks/{task}/assign/{user}', [TaskAssignmentController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | Comments
    |--------------------------------------------------------------------------
    */

    Route::get('/comments', [CommentController::class, 'index']);
    Route::post('/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

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
