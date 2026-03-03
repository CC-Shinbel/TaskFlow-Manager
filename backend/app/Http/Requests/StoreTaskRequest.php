<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_id' => [
                'nullable',
                'exists:projects,id'
            ],

            'title' => [
                'required',
                'string',
                'max:255'
            ],

            'description' => [
                'required',
                'string'
            ],

            'status' => [
                'required',
                'in:pending,in_progress,completed'
            ],

            'priority' => [
                'required',
                'in:low,medium,high'
            ],

            'due_date' => [
                'required',
                'date',
                'after_or_equal:today'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'due_date.after_or_equal' => 'Due date cannot be in the past.',
        ];
    }
}
