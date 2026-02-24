import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../hooks/UseAuth";
import axios from "axios";

import StatCard from "../components/StatCard";
import RecentTasksCard from "../components/RecentTasksCard";
import FocusTimerCard from "../components/FocusTimerCard";
import CalendarCard from "../components/CalendarCard";

interface DashboardData {
  total_tasks: number;
  completed: number;
  pending: number;
  overdue: number;
}

interface Task {
  id: number;
  title: string;
  due_date: string;
}

const DashboardPage = () => {
  const { user, logout } = useAuth();

  const [data, setData] = useState<DashboardData | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
    fetchRecentTasks();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/dashboard");
      setData(response.data.data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTasks = async () => {
    try {
      const response = await api.get("/tasks", {
        params: { sort: "desc", page: 1 }
      });

      setRecentTasks(response.data.data.data.slice(0, 5));
    } catch (err) {
      handleError(err);
    }
  };

  const handleError = (err: any) => {
    if (axios.isAxiosError(err)) {
      setError(
        err.response?.data?.message || "Dashboard error."
      );
    } else {
      setError("Unexpected error occurred.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[var(--clr-primary-a10)] via-[var(--clr-primary-a20)] to-[var(--clr-primary-a40)] overflow-hidden flex flex-col">

      {/* Background Shapes */}
      <div className="absolute w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -top-20 -left-20"></div>
      <div className="absolute w-[600px] h-[600px] bg-blue-300/20 rounded-full blur-3xl bottom-[-150px] right-[-150px]"></div>

      <div className="relative z-10 flex flex-col flex-1">

        {/* NAVBAR */}
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

        {/* ERROR DISPLAY */}
        {error && (
          <div className="mx-10 mt-6 backdrop-blur-xl bg-[#e29d9d]/20 border border-[#b13535]/30 rounded-xl p-4 text-[#b13535]">
            {error}
          </div>
        )}

        {/* MAIN GRID */}
        <div className="p-10 flex-1 grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* LEFT SIDE */}
          <div className="xl:col-span-8 flex flex-col gap-8 h-full">

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatCard title="Total Tasks" value={data?.total_tasks} />
              <StatCard title="Completed" value={data?.completed} color="text-[#58dbad]" />
              <StatCard title="Pending" value={data?.pending} color="text-[#ebca85]" />
              <StatCard title="Overdue" value={data?.overdue} color="text-[#e29d9d]" />
            </div>

            {/* Recent Tasks expands */}
            <div className="flex-1">
              <RecentTasksCard tasks={recentTasks} />
            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="xl:col-span-4 flex flex-col gap-8 h-full">

            <div className="flex-1">
              <FocusTimerCard />
            </div>

            <div className="flex-1">
              <CalendarCard tasks={recentTasks} />
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default DashboardPage;