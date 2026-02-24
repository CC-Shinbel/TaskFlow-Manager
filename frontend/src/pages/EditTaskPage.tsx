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
      <div className="flex items-center justify-center min-h-screen text-white">
        Loading task...
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-300">
        {error || "Task not found."}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[var(--clr-primary-a10)] via-[var(--clr-primary-a20)] to-[var(--clr-primary-a40)]">

      {/* Background Shapes */}
      <div className="absolute w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -top-20 -left-20"></div>
      <div className="absolute w-[600px] h-[600px] bg-blue-300/20 rounded-full blur-3xl bottom-[-150px] right-[-150px]"></div>

      <div className="relative z-10 p-10">

        <h1 className="text-3xl font-bold text-white mb-8">
          Edit Task
        </h1>

        <div className="max-w-2xl backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl shadow-xl p-8 hover:scale-105 transition duration-300">

          {error && (
            <div className="text-sm text-[#b13535] bg-[#e29d9d]/20 p-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6 text-white">

            {/* Title */}
            <div>
              <label className="block text-sm mb-2">
                Title
              </label>
              <input
                type="text"
                required
                value={task.title}
                onChange={(e) =>
                  setTask({ ...task, title: e.target.value })
                }
                className="w-full px-4 py-2 rounded-xl bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary-a0)]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm mb-2">
                Description
              </label>
              <textarea
                rows={4}
                required
                value={task.description}
                onChange={(e) =>
                  setTask({ ...task, description: e.target.value })
                }
                className="w-full px-4 py-2 rounded-xl bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary-a0)]"
              />
            </div>

            {/* Status + Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="block text-sm mb-2">
                  Status
                </label>
                <select
                  value={task.status}
                  onChange={(e) =>
                    setTask({ ...task, status: e.target.value as any })
                  }
                  className="w-full px-4 py-2 rounded-xl bg-white/50 border border-white/30"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">
                  Priority
                </label>
                <select
                  value={task.priority}
                  onChange={(e) =>
                    setTask({ ...task, priority: e.target.value as any })
                  }
                  className="w-full px-4 py-2 rounded-xl bg-white/50 border border-white/30"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">

              <button
                type="button"
                onClick={() => navigate("/tasks")}
                className="px-6 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-a10)] text-white font-semibold transition"
              >
                Update Task
              </button>

            </div>

          </form>

        </div>
      </div>
    </div>
  );
};

export default EditTaskPage;