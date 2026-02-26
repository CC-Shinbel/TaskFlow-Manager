import api from "./api";

export const projectService = {
    async getProjects() {
        return api.get("/projects");
    },

    async getProject(id: number) {
        return api.get(`/projects/${id}`);
    },

    async createProject(data: {
        name: string;
        description?: string;
    }) {
        return api.post("/projects", data);
    },

    async inviteUser(projectId: number, email: string, role: string) {
        return api.post(`/projects/${projectId}/invite`, {
            email,
            role,
        });
    },
};