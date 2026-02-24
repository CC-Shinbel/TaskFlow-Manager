import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../hooks/UseAuth";
import axios from "axios";

interface DashboardData {
  total_tasks: number;
  completed: number;
  pending: number;
  overdue: number;
}

const DashboardPage = () => {
  const { user, logout } = useAuth();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/dashboard");
      setData(response.data.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Failed to load dashboard."
        );
      } else {
        setError("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--clr-surface-a0)]">
        <p className="text-lg">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--clr-surface-a0)]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[var(--clr-primary-a10)] via-[var(--clr-primary-a20)] to-[var(--clr-primary-a40)] overflow-hidden">

      {/* Background Shapes */}
      <div className="absolute w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -top-20 -left-20"></div>
      <div className="absolute w-[600px] h-[600px] bg-blue-300/20 rounded-full blur-3xl bottom-[-150px] right-[-150px]"></div>

      <div className="relative z-10">

        {/* ===== NAVBAR ===== */}
        <div className="backdrop-blur-xl bg-white/30 border-b border-white/20 px-8 py-4 flex justify-between items-center shadow-lg">

          <h1 className="text-2xl font-bold text-white">
            TaskFlow Dashboard
          </h1>

          <div className="flex items-center gap-4">
            <span className="text-white text-sm">
              {user?.name} ({user?.role})
            </span>

            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* TOTAL TASKS */}
          <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl shadow-xl p-6 text-white hover:scale-105 transition duration-300">
            <h3 className="text-lg font-semibold mb-2">
              Total Tasks
            </h3>
            <p className="text-3xl font-bold">
              {data?.total_tasks}
            </p>
          </div>

          {/* COMPLETED */}
          <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl shadow-xl p-6 text-white hover:scale-105 transition duration-300">
            <h3 className="text-lg font-semibold mb-2">
              Completed
            </h3>
            <p className="text-3xl font-bold text-[#58dbad]">
              {data?.completed}
            </p>
          </div>

          {/* PENDING */}
          <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl shadow-xl p-6 text-white hover:scale-105 transition duration-300">
            <h3 className="text-lg font-semibold mb-2">
              Pending
            </h3>
            <p className="text-3xl font-bold text-[#ebca85]">
              {data?.pending}
            </p>
          </div>

          {/* OVERDUE */}
          <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl shadow-xl p-6 text-white hover:scale-105 transition duration-300">
            <h3 className="text-lg font-semibold mb-2">
              Overdue
            </h3>
            <p className="text-3xl font-bold text-[#e29d9d]">
              {data?.overdue}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DashboardPage;