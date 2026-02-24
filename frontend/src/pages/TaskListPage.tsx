import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../hooks/UseAuth";
import axios from "axios";

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
      fetchTasks(); // refresh list
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
    <div className="relative min-h-screen bg-gradient-to-br from-[var(--clr-primary-a10)] via-[var(--clr-primary-a20)] to-[var(--clr-primary-a40)] overflow-hidden">

      {/* Background Shapes */}
      <div className="absolute w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -top-20 -left-20"></div>
      <div className="absolute w-[600px] h-[600px] bg-blue-300/20 rounded-full blur-3xl bottom-[-150px] right-[-150px]"></div>

      <div className="relative z-10 p-10">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 text-white">
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-sm">
            Viewing as: {user?.role}
          </p>
        </div>

        {/* FILTER BAR */}
        <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl shadow-xl p-6 mb-8 grid grid-cols-1 md:grid-cols-5 gap-4">

          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 rounded-xl bg-white/50 border border-white/30 focus:outline-none"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <select
            className="px-4 py-2 rounded-xl bg-white/50 border border-white/30"
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
            className="px-4 py-2 rounded-xl bg-white/50 border border-white/30"
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
            className="px-4 py-2 rounded-xl bg-white/50 border border-white/30"
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
            className="px-4 py-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition"
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
          <p className="text-red-300 mb-4">{error}</p>
        )}

        {/* EMPTY STATE */}
        {!loading && tasks.length === 0 && (
          <div className="text-white text-center mt-10">
            No tasks found.
          </div>
        )}

        {/* TASK GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl shadow-xl p-6 text-white hover:scale-105 transition duration-300"
            >
              <h3 className="text-lg font-semibold mb-2">
                {task.title}
              </h3>

              <p className="text-sm opacity-80 mb-3">
                {task.description}
              </p>

              <div className="flex justify-between text-sm">
                <span>Status: {task.status}</span>
                <span>Priority: {task.priority}</span>
              </div>

              <div className="mt-2 text-xs opacity-70">
                Due: {task.due_date}
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() =>
                    navigate(`/tasks/${task.id}/edit`)
                  }
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(task.id)}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-lg text-sm"
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
    </div>
  );
};

export default TaskListPage;