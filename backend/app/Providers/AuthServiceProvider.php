<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

// Models
use App\Models\Task;
use App\Models\Project;
use App\Models\ProjectInvite;
use App\Models\TaskAssignmentRequest;

// Policies
use App\Policies\ProjectPolicy;
use App\Policies\TaskPolicy;
use App\Policies\ProjectInvitePolicy;
use App\Policies\TaskAssignmentPolicy;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     */
    protected $policies = [
        Project::class => ProjectPolicy::class,
        Task::class => TaskPolicy::class,
        ProjectInvite::class => ProjectInvitePolicy::class,
        TaskAssignmentRequest::class => TaskAssignmentPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
        Gate::define('assign-task', [TaskAssignmentPolicy::class, 'assign']);
        // Optional: admin override (if you have admin role)
        /*
        \Illuminate\Support\Facades\Gate::before(function ($user, $ability) {
            if (method_exists($user, 'isAdmin') && $user->isAdmin()) {
                return true;
            }
        });
        */
    }
}
