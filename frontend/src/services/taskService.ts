// taskService.ts

import api from "./api";

export const taskService = {
  getTasks(params?: any) {
    return api.get("/tasks", { params });
  },
};