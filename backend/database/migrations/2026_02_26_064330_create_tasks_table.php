<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {

            $table->id();

            // Project support (nullable = personal task)
            $table->foreignId('project_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // Task creator
            $table->foreignId('created_by')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('title');
            $table->text('description')->nullable();

            $table->enum('status', [
                'pending',
                'in_progress',
                'completed'
            ])->default('pending');

            $table->enum('priority', [
                'low',
                'medium',
                'high'
            ])->default('medium');

            $table->date('due_date')->nullable();

            $table->timestamps();

            // Indexes for performance
            $table->index('project_id');
            $table->index('created_by');
            $table->index('status');
            $table->index('priority');
            $table->index('due_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
