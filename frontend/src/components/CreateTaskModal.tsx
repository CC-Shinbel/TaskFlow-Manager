import { useEffect, useState } from "react";
import api from "../services/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  projectId?: number | null;
}

const CreateTaskModal = ({
  isOpen,
  onClose,
  onCreated,
  projectId = null,
}: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setStatus("pending");
      setPriority("medium");
      setDueDate("");
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/tasks", {
        title,
        description,
        status,
        priority,
        due_date: dueDate,
        project_id: projectId,
      });

      onCreated();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to create task."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl p-8 text-white border shadow-2xl backdrop-blur-xl bg-white/30 border-white/20 rounded-3xl">

        <h2 className="mb-6 text-2xl font-semibold">
          {projectId ? "Create Project Task" : "Create Task"}
        </h2>

        {error && (
          <div className="mb-4 text-sm text-[#b13535] bg-[#e29d9d]/20 p-3 rounded-lg border border-[#b13535]/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block mb-2 text-sm">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary-a0)]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary-a0)]"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            <div>
              <label className="block mb-2 text-sm">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 text-black border rounded-xl bg-white/70 border-white/30"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 text-black border rounded-xl bg-white/70 border-white/30"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

          </div>

          <div>
            <label className="block mb-2 text-sm">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 text-black border rounded-xl bg-white/50 border-white/30"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 text-white transition rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-50"
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

export default CreateTaskModal;