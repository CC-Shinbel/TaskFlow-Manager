<?php

namespace App\Http\Controllers;

use App\Models\ProjectInvite;
use Illuminate\Http\Request;

class ProjectInviteController extends Controller
{
    public function accept(Request $request, ProjectInvite $invite)
    {
        // 🔒 POLICY CHECK
        $this->authorize('accept', $invite);

        // Prevent duplicate join
        if ($invite->status !== 'pending') {
            return response()->json([
                'status' => false,
                'message' => 'Invite already processed.'
            ], 400);
        }

        $invite->update([
            'status' => 'accepted'
        ]);

        // Avoid duplicate attach
        if (!$invite->project->users()->where('user_id', $invite->user_id)->exists()) {
            $invite->project->users()->attach(
                $invite->user_id,
                ['role' => $invite->role]
            );
        }

        return response()->json([
            'status' => true,
            'message' => 'Joined project'
        ]);
    }

    public function decline(Request $request, ProjectInvite $invite)
    {
        // 🔒 POLICY CHECK
        $this->authorize('decline', $invite);

        if ($invite->status !== 'pending') {
            return response()->json([
                'status' => false,
                'message' => 'Invite already processed.'
            ], 400);
        }

        $invite->update([
            'status' => 'declined'
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Invite declined'
        ]);
    }
}
