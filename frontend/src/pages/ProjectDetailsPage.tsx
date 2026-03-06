import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectService } from "../services/projectService";
import { taskService } from "../services/taskService";

import CommentsSection from "../components/CommentsSection";
import CreateTaskModal from "../components/CreateTaskModal";
import ProjectMembersPanel from "../components/ProjectMembersPanel";

interface Project {
  id: number;
  name: string;
  description?: string;
}

interface User {
  id: number;
  name: string;
}

interface Task {
  id: number;
  title: string;
  status: string;
  assignees?: User[];
}

interface Member {
  id: number;
  name: string;
  role: string;
}

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>("member");

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMembersPanelOpen, setIsMembersPanelOpen] = useState(false);

  // =========================
  // LOAD PROJECT
  // =========================
  const loadProject = useCallback(async () => {

    const response = await projectService.getProject(Number(id));
    const projectData = response.data.data;

    setProject(projectData);
    setMembers(projectData.members || []);
    setCurrentUserRole(projectData.current_user_role || "member");

  }, [id]);

  // =========================
  // LOAD TASKS
  // =========================
  const loadTasks = useCallback(async () => {

    const response = await taskService.getTasks({
      project_id: id,
    });

    setTasks(response.data.data.data);

  }, [id]);

  useEffect(() => {
    loadProject();
    loadTasks();
  }, [loadProject, loadTasks]);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        Loading project...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-8 space-y-8">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">
            {project.name}
          </h1>

          <p className="text-white opacity-80">
            {project.description}
          </p>
        </div>

        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="px-6 py-3 rounded-xl bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-a10)] text-white font-semibold transition"
        >
          + Create Task
        </button>

      </div>

      {/* MAIN GRID */}
      <div className="grid flex-1 grid-cols-1 gap-8 xl:grid-cols-3">

        {/* LEFT SIDE */}
        <div className="flex flex-col h-full space-y-8 xl:col-span-2">

          {/* PROJECT TASKS */}
          <div className="p-8 text-white border shadow-xl backdrop-blur-xl bg-white/30 border-white/20 rounded-2xl">

            <h2 className="mb-6 text-xl font-semibold">
              Project Tasks
            </h2>

            {tasks.length === 0 ? (
              <p className="opacity-70">No tasks yet.</p>
            ) : (
              <div className="space-y-3">

                {tasks.map((task) => (

                  <div
                    key={task.id}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className="p-4 transition cursor-pointer bg-white/10 rounded-xl hover:bg-white/20"
                  >

                    <div className="flex justify-between">

                      <span className="font-medium">
                        {task.title}
                      </span>

                      <span className="text-sm opacity-70">
                        {task.status}
                      </span>

                    </div>

                    {task.assignees && task.assignees.length > 0 && (
                      <div className="mt-2 text-xs opacity-80">
                        Assigned to:{" "}
                        {task.assignees
                          .map(user => user.name)
                          .join(", ")}
                      </div>
                    )}

                  </div>

                ))}

              </div>
            )}

          </div>

          {/* COMMENTS */}
          <div className="flex flex-col flex-1 p-8 text-white border shadow-xl backdrop-blur-xl bg-white/30 border-white/20 rounded-2xl">

            <CommentsSection projectId={project.id} />

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col h-full">

          <div className="flex flex-col flex-1 p-6 text-white border shadow-xl backdrop-blur-xl bg-white/30 border-white/20 rounded-2xl">

            <div className="flex items-center justify-between mb-4">

              <h3 className="text-lg font-semibold">
                Project Members
              </h3>

              <button
                onClick={() => setIsMembersPanelOpen(true)}
                className="px-4 py-2 text-sm rounded-xl bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-a10)] text-white font-semibold transition"
              >
                Manage
              </button>

            </div>

            <div className="space-y-2">

              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex justify-between p-3 text-sm bg-white/10 rounded-xl"
                >
                  <span>{member.name}</span>
                  <span className="opacity-70">{member.role}</span>
                </div>
              ))}

            </div>

          </div>

        </div>

      </div>

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        projectId={project.id}
        onClose={() => setIsTaskModalOpen(false)}
        onCreated={() => {
          setIsTaskModalOpen(false);
          loadTasks();
        }}
      />

      <ProjectMembersPanel
        isOpen={isMembersPanelOpen}
        onClose={() => setIsMembersPanelOpen(false)}
        projectId={project.id}
        members={members}
        currentUserRole={currentUserRole}
        refresh={loadProject}
      />

    </div>
  );
};

export default ProjectDetailsPage;