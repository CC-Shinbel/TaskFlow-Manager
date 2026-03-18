import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

import CommentsSection from "../components/CommentsSection";
import EditTaskModal from "../components/EditTaskModal";

interface User {
  id: number;
  name: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date?: string;

  project_id?: number;

  project?: {
    id: number;
    name: string;
  };

  creator?: {
    id: number;
    name: string;
  };

  assignees?: User[];
}

const TaskDetailsPage = () => {
  const { id } = useParams();

  const [task, setTask] = useState<Task | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  // =========================
  // LOAD TASK
  // =========================
  const loadTask = async () => {
    try {
      const response = await api.get(`/tasks/${id}`);
      const taskData = response.data.data;

      setTask(taskData);

      const user = JSON.parse(localStorage.getItem("user") || "{}");

      // ✅ Permission (creator only)
      setCanEdit(taskData.creator?.id === user.id);

    } catch (err) {
      console.error("Failed to load task:", err);
    }
  };

  useEffect(() => {
    if (id) loadTask();
  }, [id]);

  // =========================
  // HELPERS
  // =========================
  const formatDate = (date?: string) => {
    if (!date) return "None";
    return new Date(date).toLocaleString();
  };

  const formatStatus = (status: string) => {
    return status.replace("_", " ");
  };

  if (!task) {
    return (
      <div className="p-8 text-white">
        Loading task...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-8 space-y-8">

      {/* =========================
          TASK HEADER
      ========================= */}
      <div className="p-8 text-white border shadow-xl backdrop-blur-xl bg-white/30 border-white/20 rounded-2xl">

        <div className="flex items-start justify-between">

          <div>
            <h1 className="text-2xl font-bold">
              {task.title}
            </h1>

            <p className="mt-2 opacity-80">
              {task.description || "No description"}
            </p>
          </div>

          {canEdit && (
            <button
              onClick={() => setEditOpen(true)}
              className="px-4 py-2 text-sm rounded-xl bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-a10)]"
            >
              Edit Task
            </button>
          )}
        </div>

        {/* =========================
            DETAILS GRID
        ========================= */}
        <div className="grid grid-cols-2 gap-6 mt-6 text-sm">

          <div>
            <span className="opacity-70">Status:</span>
            <div className="font-medium capitalize">
              {formatStatus(task.status)}
            </div>
          </div>

          <div>
            <span className="opacity-70">Priority:</span>
            <div className="font-medium capitalize">
              {task.priority}
            </div>
          </div>

          <div>
            <span className="opacity-70">Due Date:</span>
            <div>{formatDate(task.due_date)}</div>
          </div>

          <div>
            <span className="opacity-70">Created By:</span>
            <div>{task.creator?.name || "Unknown"}</div>
          </div>

          <div>
            <span className="opacity-70">Project:</span>
            <div>{task.project?.name || "Personal Task"}</div>
          </div>

          <div>
            <span className="opacity-70">Assignees:</span>
            <div>
              {task.assignees?.length
                ? task.assignees.map(a => a.name).join(", ")
                : "None"}
            </div>
          </div>

        </div>

      </div>

      {/* =========================
          COMMENTS (OPTION A)
      ========================= */}
      {task.project_id ? (
        <div className="flex flex-col flex-1 p-8 text-white border shadow-xl backdrop-blur-xl bg-white/30 border-white/20 rounded-2xl">

          <CommentsSection
            taskId={task.id}
            projectId={task.project_id}
          />

        </div>
      ) : (
        <div className="p-6 text-sm text-white border rounded-xl bg-white/20 border-white/20">
          Comments are only available for project tasks.
        </div>
      )}

      {/* =========================
          EDIT MODAL
      ========================= */}
      <EditTaskModal
        taskId={task.id}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onUpdated={() => {
          setEditOpen(false);
          loadTask();
        }}
      />

    </div>
  );
};

export default TaskDetailsPage;