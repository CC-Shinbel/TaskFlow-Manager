// taskService.ts

import api from "./api";

export const taskService = {

  /**
   * Get tasks (supports pagination, filters)
   */
  getTasks(params?: any) {
    return api.get("/tasks", { params });
  },

  /**
   * Get single task
   */
  getTask(taskId: number) {
    return api.get(`/tasks/${taskId}`);
  },

  /**
   * Create task
   */
  createTask(data: {
    title: string;
    description?: string;
    project_id?: number;
    status?: string;
    priority?: string;
    due_date?: string;
  }) {
    return api.post("/tasks", data);
  },

  /**
   * ✅ Update task (PARTIAL SUPPORTED)
   */
  updateTask(taskId: number, data: Partial<{
    title: string;
    description: string;
    status: string;
    priority: string;
    due_date: string;
  }>) {
    return api.put(`/tasks/${taskId}`, data);
  },

  /**
   * ✅ Optional: Dedicated status update (clean usage)
   */
  updateStatus(taskId: number, status: string) {
    return api.put(`/tasks/${taskId}`, { status });
    // OR if you created PATCH endpoint:
    // return api.patch(`/tasks/${taskId}/status`, { status });
  },

  /**
   * Delete task
   */
  deleteTask(taskId: number) {
    return api.delete(`/tasks/${taskId}`);
  },

  /**
   * Assign user to task
   */
  assignUser(taskId: number, userId: number) {
    return api.post(`/tasks/${taskId}/assign`, {
      user_id: userId
    });
  },

  /**
   * Remove user from task
   */
  removeUser(taskId: number, userId: number) {
    return api.delete(`/tasks/${taskId}/assign/${userId}`);
  }

};