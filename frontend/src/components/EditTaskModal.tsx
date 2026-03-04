import { useEffect, useState } from "react";
import api from "../services/api";

interface Task {
  id: number;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date?: string;
}

interface Props {
  taskId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const EditTaskModal = ({ taskId, isOpen, onClose, onUpdated }: Props) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch task
  useEffect(() => {
    if (!taskId || !isOpen) return;

    const fetchTask = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/tasks/${taskId}`);
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
  }, [taskId, isOpen]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    try {
      setError(null);
      await api.put(`/tasks/${task.id}`, task);

      onUpdated();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Update failed."
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">

      <div className="w-full max-w-3xl p-10 text-white border shadow-2xl backdrop-blur-xl bg-white/30 border-white/20 rounded-3xl">

        <h2 className="mb-8 text-2xl font-bold">
          Edit Task
        </h2>

        {loading && (
          <p className="text-white">Loading task...</p>
        )}

        {!loading && task && (
          <form
            onSubmit={handleUpdate}
            className="flex flex-col space-y-8"
          >

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
                rows={5}
                required
                value={task.description}
                onChange={(e) =>
                  setTask({
                    ...task,
                    description: e.target.value
                  })
                }
                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary-a0)]"
              />
            </div>

            {/* Status + Priority */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

              <div>
                <label className="block mb-2 text-sm">
                  Status
                </label>
                <select
                  value={task.status}
                  onChange={(e) =>
                    setTask({
                      ...task,
                      status: e.target.value as any
                    })
                  }
                  className="w-full px-4 py-3 text-black border rounded-xl bg-white/70 border-white/30"
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
                    setTask({
                      ...task,
                      priority: e.target.value as any
                    })
                  }
                  className="w-full px-4 py-3 text-black border rounded-xl bg-white/70 border-white/30"
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
                  setTask({
                    ...task,
                    due_date: e.target.value
                  })
                }
                className="w-full px-4 py-3 text-black border rounded-xl bg-white/50 border-white/30"
              />
            </div>

            {error && (
              <div className="text-sm text-[#b13535] bg-[#e29d9d]/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-4">

              <button
                type="button"
                onClick={onClose}
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
        )}

      </div>
    </div>
  );
};

export default EditTaskModal;