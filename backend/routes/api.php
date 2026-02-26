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
| All routes here are prefixed automatically with /api
| Example: /api/login
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    //NOTE: Route for logout
    Route::post('/logout', [AuthController::class, 'logout']);

    //NOTE: Dashboard route
    Route::get('/dashboard', [DashboardController::class, 'index']);

    //NOTE: Project routes
    Route::apiResource('projects', ProjectController::class)
        ->only(['index', 'store', 'show', 'destroy']);
    Route::post('projects/{project}/members', [ProjectMemberController::class, 'store']);
    Route::delete('projects/{project}/members/{user}', [ProjectMemberController::class, 'destroy']);

    //NOTE: Task routes
    Route::post('tasks/{task}/assign', [TaskAssignmentController::class, 'store']);
    Route::delete('tasks/{task}/assign/{user}', [TaskAssignmentController::class, 'destroy']);
    Route::apiResource('tasks', TaskController::class);

    //NOTE: Comment routes
    Route::get('comments', [CommentController::class, 'index']);
    Route::post('comments', [CommentController::class, 'store']);
    Route::delete('comments/{comment}', [CommentController::class, 'destroy']);

    //NOTE: Get current user details
    Route::get('/user', [AuthController::class, 'me']);
});

Route::get('/health', function () {
    return response()->json([
        'status' => true,
        'message' => 'API is working'
    ]);
});
