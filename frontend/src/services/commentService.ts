import api from "./api";

export const commentService = {
    async getComments(projectId: number, taskId?: number) {
        return api.get("/comments", {
            params: {
                project_id: projectId,
                task_id: taskId,
            },
        });
    },

    async createComment(data: {
        project_id: number;
        task_id?: number;
        content: string;
    }) {
        return api.post("/comments", data);
    },

    async deleteComment(id: string) {
        return api.delete(`/comments/${id}`);
    },
};