<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use App\Models\ProjectInvite;
use Illuminate\Http\Request;
use App\Notifications\ProjectInviteNotification;

class ProjectController extends Controller
{
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

    public function store(Request $request)
    {
        $this->authorize('create', Project::class);

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

        $project->users()->attach($user->id, [
            'role' => 'owner'
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Project created',
            'data' => $project
        ], 201);
    }

    public function show(Request $request, Project $project)
    {
        $this->authorize('view', $project);

        $user = $request->user();

        $project->load('users:id,name,email');

        $members = $project->users->map(function ($member) {
            return [
                'id' => $member->id,
                'name' => $member->name,
                'role' => $member->pivot->role
            ];
        });

        $currentUserRole = $project->users()
            ->where('users.id', $user->id)
            ->value('project_user.role');

        return response()->json([
            'status' => true,
            'message' => 'Project retrieved',
            'data' => [
                'id' => $project->id,
                'name' => $project->name,
                'description' => $project->description,
                'members' => $members,
                'current_user_role' => $currentUserRole
            ]
        ]);
    }

    public function destroy(Request $request, Project $project)
    {
        $this->authorize('delete', $project);

        $project->delete();

        return response()->json([
            'status' => true,
            'message' => 'Project deleted',
            'data' => []
        ]);
    }

    public function inviteUser(Request $request, Project $project)
    {
        $this->authorize('invite', $project);

        $request->validate([
            'email' => 'required|email',
            'role' => 'required|in:member,collaborator,co_owner'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'User with this email does not exist.'
            ], 404);
        }

        if ($project->users()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'status' => false,
                'message' => 'User already belongs to this project.'
            ], 400);
        }

        $existingInvite = ProjectInvite::where([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'status' => 'pending'
        ])->first();

        if ($existingInvite) {
            return response()->json([
                'status' => false,
                'message' => 'User already has a pending invite.'
            ], 400);
        }

        $invite = ProjectInvite::create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'invited_by' => $request->user()->id,
            'role' => $request->role
        ]);

        $user->notify(
            new ProjectInviteNotification($project, $request->user(), $invite)
        );

        return response()->json([
            'status' => true,
            'message' => 'Project invite sent'
        ]);
    }

    public function changeRole(Request $request, Project $project, User $user)
    {
        $this->authorize('changeRole', $project);

        $request->validate([
            'role' => 'required|in:member,collaborator,co_owner'
        ]);

        $project->users()->updateExistingPivot($user->id, [
            'role' => $request->role
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Role updated successfully'
        ]);
    }

    public function removeUser(Request $request, Project $project, User $user)
    {
        $this->authorize('removeUser', $project);

        if ($user->id === $project->owner_id) {
            abort(403, 'Cannot remove project owner.');
        }

        $project->users()->detach($user->id);

        return response()->json([
            'status' => true,
            'message' => 'User removed from project'
        ]);
    }
}
