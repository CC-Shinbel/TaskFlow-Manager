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

        $invite->update([
            'status' => 'accepted'
        ]);

        $invite->project->users()->attach(
            $invite->user_id,
            ['role' => $invite->role]
        );

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
