import { useNavigate } from "react-router-dom";

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
  creator?: User;
  assignees?: User[];
  project?: { id: number; name: string };
}

interface Props {
  tasks: Task[];
  currentUser?: User | null;
}

const RecentTasksCard = ({ tasks, currentUser }: Props) => {

  const navigate = useNavigate();

  const formatDate = (date?: string) => {
    if (!date) return "None";
    return new Date(date).toLocaleDateString();
  };

  const formatStatus = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/30 text-green-200";
      case "in_progress":
        return "bg-blue-500/30 text-blue-200";
      default:
        return "bg-gray-400/30 text-gray-200";
    }
  };

  return (
    <div className="flex flex-col p-6 text-white border shadow-xl backdrop-blur-xl bg-white/30 border-white/20 rounded-2xl min-h-[420px] max-h-[457px]">

      <h3 className="mb-4 text-lg font-semibold">
        Recent Tasks
      </h3>

      {tasks.length === 0 ? (
        <p className="opacity-70">No recent tasks.</p>
      ) : (

        <div className="flex-1 pr-1 space-y-4 overflow-y-auto custom-scrollbar">

          {tasks.map((task) => {

            const isAssignedToUser =
              task.assignees?.some(a => a.id === currentUser?.id);

            return (
              <div
                key={task.id}
                onClick={() => navigate(`/tasks/${task.id}`)}
                className="p-4 transition cursor-pointer rounded-xl bg-white/10 hover:bg-white/20"
              >

                {/* TITLE */}
                <h4 className="text-sm font-semibold">
                  {task.title}
                </h4>

                {/* PROJECT */}
                {task.project && (
                  <p className="mt-1 text-xs opacity-70">
                    {task.project.name}
                  </p>
                )}

                {/* STATUS + DATE */}
                <div className="flex items-center justify-between mt-3">

                  <span className={`text-xs px-2 py-1 rounded-lg ${getStatusColor(task.status)}`}>
                    {formatStatus(task.status)}
                  </span>

                  <span className="text-xs opacity-70">
                    {formatDate(task.due_date)}
                  </span>

                </div>

                {/* EXTRA INFO */}
                <div className="mt-2 space-y-1 text-xs opacity-70">

                  <div>
                    By: {task.creator?.name || "Unknown"}
                  </div>

                  {task.assignees?.length > 0 && (
                    <div>
                      Assigned: {task.assignees.map(a => a.name).join(", ")}
                    </div>
                  )}

                  <div>
                    Priority: {task.priority || "None"}
                  </div>

                  {isAssignedToUser && (
                    <div className="text-[10px] text-[var(--clr-primary-a0)] font-semibold">
                      Assigned to you
                    </div>
                  )}

                </div>

              </div>
            );
          })}

        </div>
      )}
    </div>
  );
};

export default RecentTasksCard;