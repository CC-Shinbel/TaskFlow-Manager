<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;

class ProjectMemberController extends Controller
{
    /**
     * Add member
     */
    public function store(Request $request, Project $project)
    {
        // 🔒 POLICY
        $this->authorize('invite', $project);

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:co_owner,collaborator,member'
        ]);

        if ($project->users()->where('user_id', $request->user_id)->exists()) {
            return response()->json([
                'status' => false,
                'message' => 'User already in project'
            ], 422);
        }

        $project->users()->attach($request->user_id, [
            'role' => $request->role
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Member added'
        ]);
    }

    /**
     * Remove member
     */
    public function destroy(Request $request, Project $project, User $user)
    {
        // 🔒 POLICY
        $this->authorize('removeUser', $project);

        if ($project->owner_id === $user->id) {
            abort(403, 'Cannot remove project owner.');
        }

        $project->users()->detach($user->id);

        return response()->json([
            'status' => true,
            'message' => 'Member removed'
        ]);
    }
}
