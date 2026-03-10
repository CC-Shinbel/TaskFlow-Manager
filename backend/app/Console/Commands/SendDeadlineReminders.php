<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Task;
use App\Notifications\TaskDeadlineReminderNotification;

class SendDeadlineReminders extends Command
{
    /**
     * Command name
     */
    protected $signature = 'tasks:deadline-reminders';

    /**
     * Command description
     */
    protected $description = 'Send reminder notifications for tasks due tomorrow';

    /**
     * Execute command
     */
    public function handle()
    {
        $this->info('Checking tasks due tomorrow...');

        $tasks = Task::whereDate('due_date', now()->addDay())
            ->where('status', '!=', 'completed')
            ->with('assignees')
            ->get();

        if ($tasks->isEmpty()) {
            $this->info('No tasks due tomorrow.');
            return;
        }

        foreach ($tasks as $task) {

            foreach ($task->assignees as $user) {

                $user->notify(
                    new TaskDeadlineReminderNotification($task)
                );

                $this->info("Reminder sent to {$user->name} for task {$task->title}");
            }
        }

        $this->info('Deadline reminders completed.');
    }
}
