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
  recent_tasks: Task[];
}

interface User {
  id: number;
  name: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  due_date?: string;
  created_at?: string;
  creator?: User;
  assignees?: User[];
  project?: { id: number; name: string };
}

const DashboardPage = () => {
  const { user } = useAuth();

  const [data, setData] = useState<DashboardData | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/dashboard");
      const resData = response.data.data;

      setData(resData);
      setRecentTasks(resData.recent_tasks || []);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
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
      <div className="flex items-center justify-center h-full text-white">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full overflow-hidden">

      {/* Background */}
      <div className="absolute z-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -top-20 -left-20 pointer-events-none"></div>
      <div className="absolute z-0 w-[600px] h-[600px] bg-blue-300/20 rounded-full blur-3xl bottom-[-150px] right-[-150px] pointer-events-none"></div>

      {/* CONTENT WRAPPER */}
      <div className="relative z-10 flex flex-col flex-1 min-h-0">

        {/* Error */}
        {error && (
          <div className="mx-10 mt-4 p-4 rounded-xl backdrop-blur-xl bg-[#e29d9d]/20 border border-[#b13535]/30 text-[#b13535]">
            {error}
          </div>
        )}

        {/* GRID */}
        <div className="grid items-start min-h-0 grid-cols-1 gap-8 px-10 pt-6 pb-3 xl:grid-cols-12">

          {/* LEFT */}
          <div className="flex flex-col min-h-0 gap-8 xl:col-span-8">

            {/* STATS */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <StatCard title="Total Tasks" value={data?.total_tasks} />
              <StatCard title="Completed" value={data?.completed} color="text-[#58dbad]" />
              <StatCard title="Pending" value={data?.pending} color="text-[#ebca85]" />
              <StatCard title="Overdue" value={data?.overdue} color="text-[#e29d9d]" />
            </div>

            {/* RECENT TASKS */}
            <div className="min-h-0">
              <RecentTasksCard tasks={recentTasks} currentUser={user} />
            </div>

          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-8 xl:col-span-4">

            <FocusTimerCard />

            <CalendarCard tasks={recentTasks} />

          </div>

        </div>

      </div>
    </div>
  );
};

export default DashboardPage;