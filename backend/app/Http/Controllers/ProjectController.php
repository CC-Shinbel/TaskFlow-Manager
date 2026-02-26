<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    // List projects user belongs to
    public function index(Request $request)
    {
        $user = $request->user();

        $projects = $user->projects()
            ->with('owner:id,name,email')
            ->get();

        return response()->json([
            'status' => true,
            'message' => 'Projects retrieved',
            'data' => $projects
        ]);
    }

    // Create project
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);

        $user = $request->user();

        $project = Project::create([
            'name' => $request->name,
            'description' => $request->description,
            'owner_id' => $user->id,
        ]);

        // Attach owner in pivot
        $project->users()->attach($user->id, ['role' => 'owner']);

        return response()->json([
            'status' => true,
            'message' => 'Project created',
            'data' => $project
        ], 201);
    }

    // Show project details
    public function show(Request $request, Project $project)
    {
        $this->authorizeMembership($request->user(), $project);

        return response()->json([
            'status' => true,
            'message' => 'Project retrieved',
            'data' => $project->load('users:id,name,email')
        ]);
    }

    // Delete project (only real owner)
    public function destroy(Request $request, Project $project)
    {
        if ($project->owner_id !== $request->user()->id) {
            abort(403, 'Only project owner can delete this project.');
        }

        $project->delete();

        return response()->json([
            'status' => true,
            'message' => 'Project deleted',
            'data' => []
        ]);
    }

    private function authorizeMembership($user, Project $project)
    {
        if (!$project->users()->where('user_id', $user->id)->exists()) {
            abort(403, 'Unauthorized project access.');
        }
    }
}
