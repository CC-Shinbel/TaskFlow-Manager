import { useEffect, useState } from "react";
import api from "../services/api";

interface Member {
  id: number;
  name: string;
}

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

  const [members, setMembers] = useState<Member[]>([]);
  const [assignees, setAssignees] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load project members
  useEffect(() => {
    if (!projectId || !isOpen) return;

    const loadMembers = async () => {
      const response = await api.get(`/projects/${projectId}`);
      setMembers(response.data.data.members || []);
    };

    loadMembers();
  }, [projectId, isOpen]);

  // Reset form
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setStatus("pending");
      setPriority("medium");
      setDueDate("");
      setAssignees([]);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      await api.post("/tasks", {
        title,
        description,
        status,
        priority,
        due_date: dueDate,
        project_id: projectId,
        assignees
      });

      onCreated();
      onClose();

    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">

      <div className="w-full max-w-2xl p-8 text-white border shadow-2xl backdrop-blur-xl bg-white/30 border-white/20 rounded-3xl">

        <h2 className="mb-6 text-2xl font-semibold">
          Create Project Task
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Title */}
          <div>
            <label className="block mb-2 text-sm">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl bg-white/50 border-white/30"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 text-sm">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl bg-white/50 border-white/30"
            />
          </div>

          {/* Assign Members */}
          {projectId && (
            <div>
              <label className="block mb-2 text-sm">
                Assign Members
              </label>

              <select
                multiple
                value={assignees.map(String)}
                onChange={(e) =>
                  setAssignees(
                    Array.from(
                      e.target.selectedOptions,
                      option => Number(option.value)
                    )
                  )
                }
                className="w-full px-4 py-3 text-black border rounded-xl bg-white/70"
              >
                {members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>

              <p className="mt-1 text-xs opacity-70">
                Hold CTRL / CMD to select multiple users
              </p>
            </div>
          )}

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-6">

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-3 text-black border rounded-xl bg-white/70"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-4 py-3 text-black border rounded-xl bg-white/70"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

          </div>

          {/* Due Date */}
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-3 text-black border rounded-xl bg-white/50"
          />

          {/* Buttons */}
          <div className="flex justify-end gap-4">

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-white/20"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-[var(--clr-primary-a0)]"
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