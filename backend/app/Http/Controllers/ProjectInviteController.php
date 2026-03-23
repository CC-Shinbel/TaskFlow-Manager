<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProjectInvite;

class ProjectInviteController extends Controller
{
    //
    public function accept(ProjectInvite $invite)
    {
        // ✅ Prevent re-accept / re-decline
        if ($invite->status !== 'pending') {
            return response()->json([
                'status' => false,
                'message' => 'Invite already handled'
            ], 400);
        }

        // ✅ Update status
        $invite->update([
            'status' => 'accepted'
        ]);

        // ✅ Prevent duplicate pivot entries
        $invite->project->users()->syncWithoutDetaching([
            $invite->user_id => ['role' => $invite->role]
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Joined project'
        ]);
    }

    public function decline(ProjectInvite $invite)
    {

        $invite->update([
            'status' => 'declined'
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Invite declined'
        ]);
    }
}
