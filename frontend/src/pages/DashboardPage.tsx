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
  const { user } = useAuth();

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
      setError(err.response?.data?.message || "Dashboard error.");
    } else {
      setError("Unexpected error occurred.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-[var(--clr-primary-a10)] via-[var(--clr-primary-a20)] to-[var(--clr-primary-a40)]">

      {/* Background Blobs */}
      <div className="absolute z-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -top-20 -left-20"></div>
      <div className="absolute z-0 w-[600px] h-[600px] bg-blue-300/20 rounded-full blur-3xl bottom-[-150px] right-[-150px]"></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col flex-1">

        {/* Error Display */}
        {error && (
          <div className="mx-10 mt-6 p-4 rounded-xl backdrop-blur-xl bg-[#e29d9d]/20 border border-[#b13535]/30 text-[#b13535]">
            {error}
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid flex-1 grid-cols-1 gap-8 p-10 xl:grid-cols-12">

          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-8 xl:col-span-8">

            {/* Stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <StatCard title="Total Tasks" value={data?.total_tasks} />
              <StatCard title="Completed" value={data?.completed} color="text-[#58dbad]" />
              <StatCard title="Pending" value={data?.pending} color="text-[#ebca85]" />
              <StatCard title="Overdue" value={data?.overdue} color="text-[#e29d9d]" />
            </div>

            {/* Recent Tasks */}
            <div className="flex-1">
              <RecentTasksCard tasks={recentTasks} />
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-8 xl:col-span-4">

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