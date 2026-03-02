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
    <div className="flex flex-col h-full p-8">

      <h1 className="mb-8 text-3xl font-bold text-white">
        Create New Task
      </h1>

      {/* FULL WIDTH + HEIGHT CARD */}
      <div className="flex-1 w-full h-full p-10 overflow-y-auto text-white border shadow-xl backdrop-blur-xl bg-white/30 border-white/20 rounded-2xl">

        <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-8">

          {/* Title */}
          <div>
            <label className="block mb-2 text-sm">
              Title
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary-a0)]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary-a0)]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

            <div>
              <label className="block mb-2 text-sm">
                Status
              </label>
              <select
                className="w-full px-4 py-3 text-black border rounded-xl bg-white/50 border-white/30"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
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
                className="w-full px-4 py-3 text-black border rounded-xl bg-white/50 border-white/30"
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
            <label className="block mb-2 text-sm">
              Due Date
            </label>
            <input
              type="date"
              required
              className="w-full px-4 py-3 text-black border rounded-xl bg-white/50 border-white/30"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-sm text-[#b13535] bg-[#e29d9d]/20 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Push buttons to bottom */}
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
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-a10)] text-white font-semibold transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Task"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default CreateTaskPage;