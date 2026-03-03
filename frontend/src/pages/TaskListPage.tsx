import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../hooks/UseAuth";
import axios from "axios";
import CreateTaskModal from "../components/CreateTaskModal";

interface Task {
  id: number;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string;
}

const TaskListPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [sort, setSort] = useState("asc");

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // =========================
  // FETCH TASKS
  // =========================
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/tasks", {
        params: {
          page,
          search,
          status,
          priority,
          sort,
        },
      });

      setTasks(response.data.data.data);
      setLastPage(response.data.data.last_page);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Failed to fetch tasks."
        );
      } else {
        setError("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, status, priority, sort]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // =========================
  // DELETE TASK
  // =========================
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Delete failed."
        );
      } else {
        setError("Unexpected error occurred.");
      }
    }
  };

  return (
    <div className="relative min-h-full overflow-hidden">

      <div className="relative z-10 p-10">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8 text-white">
          <div>
            <h1 className="text-3xl font-bold">Tasks</h1>
            <p className="text-sm opacity-70">
              Viewing as: {user?.role}
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-6 py-3 rounded-xl bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-a10)] text-white font-semibold transition"
          >
            + Create Task
          </button>
        </div>

        {/* FILTER BAR */}
        <div className="grid grid-cols-1 gap-4 p-6 mb-8 border shadow-xl backdrop-blur-xl bg-white/30 border-white/20 rounded-2xl md:grid-cols-5">

          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 border rounded-xl bg-white/50 border-white/30 focus:outline-none"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <select
            className="px-4 py-2 text-black border rounded-xl bg-white/50 border-white/30"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            className="px-4 py-2 text-black border rounded-xl bg-white/50 border-white/30"
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select
            className="px-4 py-2 text-black border rounded-xl bg-white/50 border-white/30"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="asc">Due Date ↑</option>
            <option value="desc">Due Date ↓</option>
          </select>

          <button
            onClick={() => {
              setSearch("");
              setStatus("");
              setPriority("");
              setSort("asc");
              setPage(1);
            }}
            className="px-4 py-2 text-white transition rounded-xl bg-white/20 hover:bg-white/30"
          >
            Reset
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <p className="text-white">Loading tasks...</p>
        )}

        {/* ERROR */}
        {error && (
          <p className="mb-4 text-red-300">{error}</p>
        )}

        {/* EMPTY */}
        {!loading && tasks.length === 0 && (
          <div className="mt-10 text-center text-white">
            No tasks found.
          </div>
        )}

        {/* TASK GRID */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-6 text-white transition duration-300 border shadow-xl backdrop-blur-xl bg-white/30 border-white/20 rounded-2xl hover:scale-105"
            >
              <h3 className="mb-2 text-lg font-semibold">
                {task.title}
              </h3>

              <p className="mb-3 text-sm opacity-80">
                {task.description}
              </p>

              <div className="flex justify-between text-sm">
                <span>Status: {task.status}</span>
                <span>Priority: {task.priority}</span>
              </div>

              <div className="mt-2 text-xs opacity-70">
                Due: {task.due_date}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() =>
                    navigate(`/tasks/${task.id}/edit`)
                  }
                  className="px-3 py-1 text-sm bg-blue-500 rounded-lg hover:bg-blue-600"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(task.id)}
                  className="px-3 py-1 text-sm bg-red-500 rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center gap-4 mt-10 text-white">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 rounded-xl bg-white/20 disabled:opacity-40"
          >
            Prev
          </button>

          <span>
            Page {page} of {lastPage}
          </span>

          <button
            disabled={page === lastPage}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-xl bg-white/20 disabled:opacity-40"
          >
            Next
          </button>
        </div>

      </div>

      {/* CREATE TASK MODAL */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={fetchTasks}
      />

    </div>
  );
};

export default TaskListPage;