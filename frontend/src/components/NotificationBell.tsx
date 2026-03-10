import { useEffect, useState } from "react";
import api from "../services/api";

interface Notification {
  id: string;
  read_at: string | null;
  data: any;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const loadNotifications = async () => {
    const response = await api.get("/notifications");
    setNotifications(response.data);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    await api.post(`/notifications/${id}/read`);
    loadNotifications();
  };

  const acceptInvite = async (inviteId: number) => {
    await api.post(`/project-invites/${inviteId}/accept`);
    loadNotifications();
  };

  const declineInvite = async (inviteId: number) => {
    await api.post(`/project-invites/${inviteId}/decline`);
    loadNotifications();
  };

  const acceptAssignment = async (requestId: number) => {
    await api.post(`/task-assignments/${requestId}/accept`);
    loadNotifications();
  };

  const declineAssignment = async (requestId: number) => {
    await api.post(`/task-assignments/${requestId}/decline`);
    loadNotifications();
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <div className="relative">

      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-white transition rounded-full hover:bg-white/20"
      >
        🔔

        {unreadCount > 0 && (
          <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white rounded-full -top-1 -right-1 bg-[var(--clr-primary-a0)]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 z-50 w-[360px] mt-4 p-4 border shadow-xl backdrop-blur-xl bg-white/30 border-white/20 rounded-2xl">

          <h3 className="mb-4 text-lg font-semibold text-white">
            Notifications
          </h3>

          {notifications.length === 0 ? (
            <p className="text-sm text-white opacity-70">
              No notifications
            </p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">

              {notifications.map(notification => {

                const data = notification.data;

                return (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-xl bg-white/10 text-sm text-white ${
                      notification.read_at ? "opacity-70" : ""
                    }`}
                  >

                    {/* Project Invite */}
                    {data.type === "project_invite" && (
                      <>
                        <p>
                          <span className="font-semibold">
                            {data.invited_by_name}
                          </span>{" "}
                          invited you to{" "}
                          <span className="font-semibold">
                            {data.project_name}
                          </span>
                        </p>

                        <div className="flex gap-2 mt-3">

                          <button
                            onClick={() => acceptInvite(data.invite_id)}
                            className="px-3 py-1 text-xs font-semibold transition rounded-lg bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-a10)]"
                          >
                            Accept
                          </button>

                          <button
                            onClick={() => declineInvite(data.invite_id)}
                            className="px-3 py-1 text-xs transition rounded-lg bg-white/20 hover:bg-white/30"
                          >
                            Decline
                          </button>

                        </div>
                      </>
                    )}

                    {/* Task Assignment */}
                    {data.type === "task_assignment" && (
                      <>
                        <p>
                          <span className="font-semibold">
                            {data.assigned_by_name}
                          </span>{" "}
                          assigned you to{" "}
                          <span className="font-semibold">
                            {data.task_title}
                          </span>
                        </p>

                        <div className="flex gap-2 mt-3">

                          <button
                            onClick={() => acceptAssignment(data.request_id)}
                            className="px-3 py-1 text-xs font-semibold transition rounded-lg bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-a10)]"
                          >
                            Accept
                          </button>

                          <button
                            onClick={() => declineAssignment(data.request_id)}
                            className="px-3 py-1 text-xs transition rounded-lg bg-white/20 hover:bg-white/30"
                          >
                            Decline
                          </button>

                        </div>
                      </>
                    )}

                    {/* Comment Notification */}
                    {data.type === "task_comment" && (
                      <p>
                        New comment on{" "}
                        <span className="font-semibold">
                          {data.task_title}
                        </span>
                      </p>
                    )}

                    {/* Deadline Reminder */}
                    {data.type === "task_deadline_reminder" && (
                      <p>
                        Task{" "}
                        <span className="font-semibold">
                          {data.task_title}
                        </span>{" "}
                        is due tomorrow
                      </p>
                    )}

                    {/* Overdue */}
                    {data.type === "task_overdue" && (
                      <p className="text-red-300">
                        Task{" "}
                        <span className="font-semibold">
                          {data.task_title}
                        </span>{" "}
                        is overdue
                      </p>
                    )}

                    {!notification.read_at && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="block mt-3 text-xs opacity-70 hover:opacity-100"
                      >
                        Mark as read
                      </button>
                    )}

                  </div>
                );
              })}

            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default NotificationBell;