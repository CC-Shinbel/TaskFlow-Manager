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
  created_by: number;
  project?: {
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

  const loadTask = async () => {

    const response = await api.get(`/tasks/${id}`);
    const taskData = response.data.data;

    setTask(taskData);

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const role =
      taskData.project?.current_user_role || "member";

    const allowed =
      taskData.created_by === user.id ||
      role === "co_owner" ||
      role === "collaborator";

    setCanEdit(allowed);
  };

  useEffect(() => {
    loadTask();
  }, [id]);

  if (!task) {
    return (
      <div className="p-8 text-white">
        Loading task...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-8 space-y-8">

      {/* TASK HEADER */}
      <div className="p-8 text-white border shadow-xl backdrop-blur-xl bg-white/30 border-white/20 rounded-2xl">

        <div className="flex items-start justify-between">

          <div>

            <h1 className="text-2xl font-bold">
              {task.title}
            </h1>

            <p className="mt-2 opacity-80">
              {task.description}
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

        {/* DETAILS */}
        <div className="grid grid-cols-2 gap-6 mt-6 text-sm">

          <div>
            <span className="opacity-70">Status:</span>
            <div>{task.status}</div>
          </div>

          <div>
            <span className="opacity-70">Priority:</span>
            <div>{task.priority}</div>
          </div>

          <div>
            <span className="opacity-70">Due Date:</span>
            <div>{task.due_date || "None"}</div>
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

      {/* COMMENTS */}
      <div className="flex flex-col flex-1 p-8 text-white border shadow-xl backdrop-blur-xl bg-white/30 border-white/20 rounded-2xl">

        <CommentsSection taskId={task.id} />

      </div>

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