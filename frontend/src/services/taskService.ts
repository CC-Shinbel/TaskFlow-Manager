// taskService.ts

import api from "./api";

/**
 * Task shape (based on your controller formatTask)
 */
export interface Task {
  id: number;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed";
  priority?: "low" | "medium" | "high";
  due_date?: string;
  created_at?: string;
  updated_at?: string;

  project_id?: number;

  project?: {
    id: number;
    name: string;
  };

  creator?: {
    id: number;
    name: string;
  };

  assignees?: {
    id: number;
    name: string;
  }[];
}

/**
 * Paginated response wrapper
 */
export interface PaginatedTasks {
  data: Task[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const taskService = {

  /**
   * =========================
   * GET TASKS (Paginated + Filters)
   * =========================
   */
  async getTasks(params?: {
    project_id?: number | string;
    status?: string;
    page?: number;
    sort_by?: string;
    direction?: "asc" | "desc";
  }) {
    const response = await api.get("/tasks", { params });

    return response.data.data as PaginatedTasks;
  },

  /**
   * =========================
   * GET SINGLE TASK
   * =========================
   */
  async getTask(taskId: number) {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data.data as Task;
  },

  /**
   * =========================
   * CREATE TASK
   * =========================
   */
  async createTask(data: {
    title: string;
    description?: string;
    project_id?: number;
    status?: string;
    priority?: string;
    due_date?: string;
  }) {
    const response = await api.post("/tasks", data);
    return response.data.data as Task;
  },

  /**
   * =========================
   * UPDATE TASK (Partial)
   * =========================
   */
  async updateTask(
    taskId: number,
    data: Partial<{
      title: string;
      description: string;
      status: string;
      priority: string;
      due_date: string;
    }>
  ) {
    const response = await api.put(`/tasks/${taskId}`, data);
    return response.data.data as Task;
  },

  /**
   * =========================
   * UPDATE STATUS (Shortcut)
   * =========================
   */
  async updateStatus(taskId: number, status: string) {
    const response = await api.put(`/tasks/${taskId}`, { status });
    return response.data.data as Task;
  },

  /**
   * =========================
   * DELETE TASK
   * =========================
   */
  async deleteTask(taskId: number) {
    return api.delete(`/tasks/${taskId}`);
  },

  /**
   * =========================
   * ASSIGN USER
   * =========================
   */
  async assignUser(taskId: number, userId: number) {
    return api.post(`/tasks/${taskId}/assign`, {
      user_id: userId
    });
  },

  /**
   * =========================
   * REMOVE USER
   * =========================
   */
  async removeUser(taskId: number, userId: number) {
    return api.delete(`/tasks/${taskId}/assign/${userId}`);
  }

};