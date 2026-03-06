import { useEffect, useState } from "react";
import api from "../services/api";

interface Member {
  id: number;
  name: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date?: string;
  project_id?: number;
  assignees?: Member[];
}

interface Props {
  taskId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const EditTaskModal = ({ taskId, isOpen, onClose, onUpdated }: Props) => {

  const [task, setTask] = useState<Task | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [assignees, setAssignees] = useState<number[]>([]);
  const [originalAssignees, setOriginalAssignees] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    if (!taskId || !isOpen) return;

    const fetchTask = async () => {

      try {

        setLoading(true);

        const response = await api.get(`/tasks/${taskId}`);
        const taskData = response.data.data;

        setTask(taskData);

        const ids =
          taskData.assignees?.map((u: Member) => u.id) || [];

        setAssignees(ids);
        setOriginalAssignees(ids);

        if (taskData.project_id) {
          const project = await api.get(`/projects/${taskData.project_id}`);
          setMembers(project.data.data.members || []);
        }

      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load task.");
      } finally {
        setLoading(false);
      }

    };

    fetchTask();

  }, [taskId, isOpen]);

  if (!isOpen) return null;

  const handleUpdate = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!task) return;

    try {

      await api.put(`/tasks/${task.id}`, {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date
      });

      const removed = originalAssignees.filter(
        id => !assignees.includes(id)
      );

      const added = assignees.filter(
        id => !originalAssignees.includes(id)
      );

      for (const userId of removed) {
        await api.delete(`/tasks/${task.id}/assign/${userId}`);
      }

      for (const userId of added) {
        await api.post(`/tasks/${task.id}/assign`, {
          user_id: userId
        });
      }

      onUpdated();
      onClose();

    } catch (err: any) {
      setError(err.response?.data?.message || "Update failed.");
    }

  };

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

          <form onSubmit={handleUpdate} className="flex flex-col space-y-8">

            <input
              value={task.title}
              onChange={(e) =>
                setTask({ ...task, title: e.target.value })
              }
              className="w-full px-4 py-3 border rounded-xl bg-white/50 border-white/30"
            />

            <textarea
              rows={4}
              value={task.description}
              onChange={(e) =>
                setTask({
                  ...task,
                  description: e.target.value
                })
              }
              className="w-full px-4 py-3 border rounded-xl bg-white/50 border-white/30"
            />

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

            {error && (
              <div className="text-red-400">
                {error}
              </div>
            )}

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