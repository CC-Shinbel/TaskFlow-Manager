import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const CreateTaskPage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post("/tasks", {
        title,
        description,
        status,
        priority,
        due_date: dueDate,
      });

      navigate("/tasks");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to create task."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[var(--clr-primary-a10)] via-[var(--clr-primary-a20)] to-[var(--clr-primary-a40)]">

      {/* Background Shapes */}
      <div className="absolute w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -top-20 -left-20"></div>
      <div className="absolute w-[600px] h-[600px] bg-blue-300/20 rounded-full blur-3xl bottom-[-150px] right-[-150px]"></div>

      <div className="relative z-10 p-10">

        <h1 className="text-3xl font-bold text-white mb-8">
          Create New Task
        </h1>

        <div className="max-w-2xl backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl shadow-xl p-8">

          <form onSubmit={handleSubmit} className="space-y-6 text-white">

            {/* Title */}
            <div>
              <label className="block text-sm mb-2">
                Title
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 rounded-xl bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary-a0)]"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                className="w-full px-4 py-2 rounded-xl bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary-a0)]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Status & Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="block text-sm mb-2">
                  Status
                </label>
                <select
                  className="w-full px-4 py-2 rounded-xl bg-white/50 border border-white/30"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
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
                  className="w-full px-4 py-2 rounded-xl bg-white/50 border border-white/30"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm mb-2">
                Due Date
              </label>
              <input
                type="date"
                required
                className="w-full px-4 py-2 rounded-xl bg-white/50 border border-white/30"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-sm text-[#b13535] bg-[#e29d9d]/20 p-2 rounded-lg">
                {error}
              </div>
            )}

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
                disabled={loading}
                className="px-6 py-2 rounded-xl bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-a10)] text-white font-semibold transition disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Task"}
              </button>

            </div>

          </form>

        </div>
      </div>
    </div>
  );
};

export default CreateTaskPage;