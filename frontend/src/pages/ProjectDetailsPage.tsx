import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectService } from "../services/projectService";
import { taskService } from "../services/taskService";
import toast from "react-hot-toast";

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
  description?: string;
  status: string;
  priority?: string;
  created_at?: string;
  updated_at?: string;
  due_date?: string;
  creator?: { id: number; name: string };
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

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMembersPanelOpen, setIsMembersPanelOpen] = useState(false);

  // =========================
  // FILTER STATES (NEW)
  // =========================
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [dueDateFilter, setDueDateFilter] = useState("");

  // =========================
  // HELPERS
  // =========================
  const formatDate = (date?: string) => {
    if (!date) return "None";
    return new Date(date).toLocaleString();
  };

  const formatStatus = (status: string) => {
    return status
      .replace("_", " ")
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // ✅ STATUS COLOR (SAFE ADD)
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/30 text-green-200";
      case "in_progress":
        return "bg-blue-500/30 text-blue-200";
      default:
        return "bg-gray-400/30 text-gray-200";
    }
  };

  // =========================
  // LOAD PROJECT
  // =========================
  const loadProject = useCallback(async () => {
    try {
      const response = await projectService.getProject(Number(id));
      const projectData = response.data.data;

      setProject(projectData);
      setMembers(projectData.members || []);
      setCurrentUserRole(projectData.current_user_role || "member");

    } catch (err) {
      console.error("Failed to load project:", err);
      toast.error("Failed to load project");
    }
  }, [id]);

  // =========================
  // LOAD TASKS
  // =========================
  const loadTasks = useCallback(async (pageNumber = 1) => {
    try {
      const resData = await taskService.getTasks({
        project_id: id,
        page: pageNumber
      });

      setTasks(resData.data);
      setPage(resData.current_page);
      setLastPage(resData.last_page);

    } catch (err) {
      console.error("Failed to load tasks:", err);
      toast.error("Failed to load tasks");
    }
  }, [id]);

  const updateTaskStatus = async (taskId: number, status: string) => {
    try {
      await taskService.updateStatus(taskId, status);
      await loadTasks(page);
      toast.success("Task updated");
    } catch {
      toast.error("Failed to update task");
    }
  };

  useEffect(() => {
    if (!id) return;
    loadProject();
    loadTasks(1);
  }, [id, loadProject, loadTasks]);

  // =========================
  // FILTER LOGIC (NON-DESTRUCTIVE)
  // =========================
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        !statusFilter || task.status === statusFilter;

      const matchesPriority =
        !priorityFilter || task.priority === priorityFilter;

      const matchesAssignee =
        !assigneeFilter ||
        task.assignees?.some(a => a.id === Number(assigneeFilter));

      const matchesDueDate =
        !dueDateFilter ||
        (task.due_date &&
          new Date(task.due_date).toDateString() ===
            new Date(dueDateFilter).toDateString());

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesAssignee &&
        matchesDueDate
      );
    });
  }, [tasks, search, statusFilter, priorityFilter, assigneeFilter, dueDateFilter]);

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
            {project.description || "No description"}
          </p>
        </div>

        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="px-6 py-3 rounded-xl bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-a10)] text-white font-semibold transition"
        >
          + Create Task
        </button>
      </div>

      {/* ✅ FILTER BAR (STYLING PRESERVED) */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 text-white border rounded-xl bg-white/20 border-white/30 placeholder-white/60"
        />

        <select onChange={(e) => setStatusFilter(e.target.value)} className="px-2 py-2 text-white border rounded-xl bg-white/20 border-white/30">
          <option value="">Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select onChange={(e) => setPriorityFilter(e.target.value)} className="px-2 py-2 text-white border rounded-xl bg-white/20 border-white/30">
          <option value="">Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select onChange={(e) => setAssigneeFilter(e.target.value)} className="px-2 py-2 text-white border rounded-xl bg-white/20 border-white/30">
          <option value="">Assignee</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <input
          type="date"
          onChange={(e) => setDueDateFilter(e.target.value)}
          className="px-2 py-2 text-white border rounded-xl bg-white/20 border-white/30"
        />
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">

        {/* TASKS */}
        <div className="p-8 text-white border shadow-xl xl:col-span-2 backdrop-blur-xl bg-white/30 border-white/20 rounded-2xl">

          <h2 className="mb-6 text-xl font-semibold">
            Project Tasks
          </h2>

          {filteredTasks.length === 0 ? (
            <p className="opacity-70">No tasks found.</p>
          ) : (
            <>
              <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">

                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-5 transition bg-white/10 rounded-xl hover:bg-white/20"
                  >

                    <div onClick={() => navigate(`/tasks/${task.id}`)}>
                      <h3 className="text-lg font-semibold">{task.title}</h3>
                      <p className="text-sm opacity-80">{task.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs opacity-80">
                      <span>Created: {formatDate(task.created_at)}</span>
                      <span>Updated: {formatDate(task.updated_at)}</span>
                      <span>Due: {formatDate(task.due_date)}</span>
                      <span>By: {task.creator?.name || "Unknown"}</span>
                    </div>

                    {/* ✅ COLORED STATUS */}
                    <div className="flex items-center justify-between mt-4">

                      <span className={`text-sm font-medium px-2 py-1 rounded-lg ${getStatusColor(task.status)}`}>
                        {formatStatus(task.status)}
                      </span>

                      <div className="flex gap-2">
                        {["pending", "in_progress", "completed"].map((s) => (
                          <button
                            key={s}
                            onClick={() => updateTaskStatus(task.id, s)}
                            className={`px-2 py-1 text-xs rounded-lg transition ${
                              task.status === s
                                ? "bg-[var(--clr-primary-a0)]"
                                : "bg-white/20 hover:bg-white/30"
                            }`}
                          >
                            {formatStatus(s)}
                          </button>
                        ))}
                      </div>

                    </div>

                    <div className="mt-2 text-xs capitalize opacity-80">
                      Priority: {task.priority || "None"}
                    </div>

                    {task.assignees?.length > 0 && (
                      <div className="mt-2 text-xs opacity-80">
                        Assigned to:{" "}
                        {task.assignees.map(u => u.name).join(", ")}
                      </div>
                    )}

                  </div>
                ))}

              </div>

              {/* PAGINATION */}
              <div className="flex items-center justify-between mt-6">
                <button
                  disabled={page === 1}
                  onClick={() => loadTasks(page - 1)}
                  className="px-4 py-2 text-sm rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="text-sm opacity-80">
                  Page {page} of {lastPage}
                </span>

                <button
                  disabled={page === lastPage}
                  onClick={() => loadTasks(page + 1)}
                  className="px-4 py-2 text-sm rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </>
          )}

        </div>

        {/* MEMBERS (UNCHANGED) */}
        <div className="flex flex-col h-full p-6 text-white border shadow-xl backdrop-blur-xl bg-white/30 border-white/20 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Project Members</h3>
            <button
              onClick={() => setIsMembersPanelOpen(true)}
              className="px-4 py-2 text-sm rounded-xl bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-a10)] text-white font-semibold transition"
            >
              Manage
            </button>
          </div>

          <div className="flex-1 pr-1 space-y-2 overflow-y-auto custom-scrollbar">
            {members.map((member) => (
              <div key={member.id} className="flex justify-between p-3 text-sm bg-white/10 rounded-xl">
                <span>{member.name}</span>
                <span className="capitalize opacity-70">{member.role}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* COMMENTS */}
      <div className="flex flex-col p-8 text-white border shadow-xl backdrop-blur-xl bg-white/30 border-white/20 rounded-2xl">
        <CommentsSection projectId={project.id} />
      </div>

      {/* MODALS */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        projectId={project.id}
        onClose={() => setIsTaskModalOpen(false)}
        onCreated={() => {
          setIsTaskModalOpen(false);
          loadTasks(page);
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