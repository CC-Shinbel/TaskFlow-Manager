import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

interface Task {
  id: number;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date?: string;
}

const EditTaskPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await api.get(`/tasks/${id}`);
        setTask(response.data.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to load task."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    setError(null);

    try {
      await api.put(`/tasks/${id}`, task);
      navigate("/tasks");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Update failed."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        Loading task...
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center h-full text-red-300">
        {error || "Task not found."}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-8">

      <h1 className="mb-8 text-3xl font-bold text-white">
        Edit Task
      </h1>

      {/* FULL WIDTH + HEIGHT CARD */}
      <div className="flex-1 w-full h-full p-10 overflow-y-auto text-white border shadow-xl backdrop-blur-xl bg-white/30 border-white/20 rounded-2xl">

        <form onSubmit={handleUpdate} className="flex flex-col h-full space-y-8">

          {/* Title */}
          <div>
            <label className="block mb-2 text-sm">
              Title
            </label>
            <input
              type="text"
              required
              value={task.title}
              onChange={(e) =>
                setTask({ ...task, title: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary-a0)]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 text-sm">
              Description
            </label>
            <textarea
              rows={6}
              required
              value={task.description}
              onChange={(e) =>
                setTask({ ...task, description: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary-a0)]"
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

            <div>
              <label className="block mb-2 text-sm">
                Status
              </label>
              <select
                value={task.status}
                onChange={(e) =>
                  setTask({ ...task, status: e.target.value as any })
                }
                className="w-full px-4 py-3 text-black border rounded-xl bg-white/70 border-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary-a0)]"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm">
                Priority
              </label>
              <select
                value={task.priority}
                onChange={(e) =>
                  setTask({ ...task, priority: e.target.value as any })
                }
                className="w-full px-4 py-3 text-black border rounded-xl bg-white/70 border-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary-a0)]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

          </div>

          {/* Due Date */}
          <div>
            <label className="block mb-2 text-sm">
              Due Date
            </label>
            <input
              type="date"
              value={task.due_date || ""}
              onChange={(e) =>
                setTask({ ...task, due_date: e.target.value })
              }
              className="w-full px-4 py-3 text-black border rounded-xl bg-white/50 border-white/30"
            />
          </div>

          {error && (
            <div className="text-sm text-[#b13535] bg-[#e29d9d]/20 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Buttons stick to bottom */}
          <div className="flex justify-end gap-4 pt-4 mt-auto">

            <button
              type="button"
              onClick={() => navigate("/tasks")}
              className="px-6 py-3 text-white transition rounded-xl bg-white/20 hover:bg-white/30"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-a10)] text-white font-semibold transition"
            >
              Update Task
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default EditTaskPage;