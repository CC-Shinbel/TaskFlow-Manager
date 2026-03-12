import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import api from "../services/api";
import toast from "react-hot-toast";

interface NotificationData {
  type: string;
  [key: string]: any;
}

interface Notification {
  id: string;
  read_at: string | null;
  data: NotificationData;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleDropdown = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();

    setPosition({
      top: rect.bottom + 10,
      right: window.innerWidth - rect.right
    });

    setOpen(!open);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = async (id: string) => {
    await api.post(`/notifications/${id}/read`);
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      )
    );
  };

  const acceptInvite = async (inviteId: number, notificationId: string) => {
    try {
      await api.post(`/project-invites/${inviteId}/accept`);
      removeNotification(notificationId);
      toast.success("Project invite accepted 🎉");
    } catch {
      toast.error("Failed to accept invite");
    }
  };

  const declineInvite = async (inviteId: number, notificationId: string) => {
    try {
      await api.post(`/project-invites/${inviteId}/decline`);
      removeNotification(notificationId);
      toast("Invite declined");
    } catch {
      toast.error("Failed to decline invite");
    }
  };

  const acceptAssignment = async (requestId: number, notificationId: string) => {
    try {
      await api.post(`/task-assignments/${requestId}/accept`);
      removeNotification(notificationId);
      toast.success("Task accepted ✔️");
    } catch {
      toast.error("Failed to accept task");
    }
  };

  const declineAssignment = async (requestId: number, notificationId: string) => {
    try {
      await api.post(`/task-assignments/${requestId}/decline`);
      removeNotification(notificationId);
      toast("Task declined");
    } catch {
      toast.error("Failed to decline task");
    }
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <>
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="relative p-2 text-white transition rounded-full hover:bg-white/20"
      >
        🔔

        {unreadCount > 0 && (
          <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white rounded-full -top-1 -right-1 bg-[var(--clr-primary-a0)]">
            {unreadCount}
          </span>
        )}
      </button>

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: position.top,
              right: position.right,
              zIndex: 999999
            }}
            className="w-[360px] p-4 border shadow-xl backdrop-blur-xl bg-white/30 border-white/20 rounded-2xl"
          >
            <h3 className="mb-4 text-lg font-semibold text-white">
              Notifications
            </h3>

            {notifications.length === 0 ? (
              <p className="text-sm text-white opacity-70">
                No notifications
              </p>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto">
                {notifications.map(notification => {
                  const data = notification.data;

                  return (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-xl bg-white/10 text-sm text-white transition ${
                        notification.read_at ? "opacity-70" : ""
                      }`}
                    >
                      {/* PROJECT INVITE */}
                      {data.type === "project_invite" && (
                        <>
                          <p>
                            <span className="font-semibold">
                              {data.invited_by_name || "Someone"}
                            </span>{" "}
                            invited you to{" "}
                            <span className="font-semibold">
                              {data.project_name || "a project"}
                            </span>
                          </p>

                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() =>
                                acceptInvite(data.invite_id, notification.id)
                              }
                              className="px-3 py-1 text-xs font-semibold rounded-lg bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-a10)]"
                            >
                              Accept
                            </button>

                            <button
                              onClick={() =>
                                declineInvite(data.invite_id, notification.id)
                              }
                              className="px-3 py-1 text-xs rounded-lg bg-white/20 hover:bg-white/30"
                            >
                              Decline
                            </button>
                          </div>
                        </>
                      )}

                      {/* TASK ASSIGNMENT */}
                      {data.type === "task_assignment" && (
                        <>
                          <p>
                            <span className="font-semibold">
                              {data.assigned_by_name || "Someone"}
                            </span>{" "}
                            assigned you to{" "}
                            <span className="font-semibold">
                              {data.task_title || "a task"}
                            </span>
                          </p>

                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() =>
                                acceptAssignment(data.request_id, notification.id)
                              }
                              className="px-3 py-1 text-xs font-semibold rounded-lg bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-a10)]"
                            >
                              Accept
                            </button>

                            <button
                              onClick={() =>
                                declineAssignment(data.request_id, notification.id)
                              }
                              className="px-3 py-1 text-xs rounded-lg bg-white/20 hover:bg-white/30"
                            >
                              Decline
                            </button>
                          </div>
                        </>
                      )}

                      {/* COMMENT */}
                      {data.type === "new_comment" && (
                        <p>
                          <span className="font-semibold">
                            {data.user_name || "Someone"}
                          </span>{" "}
                          commented {data.task_id ? "on a task" : "on the project"}
                        </p>
                      )}

                      {/* DEADLINE */}
                      {data.type === "task_deadline_reminder" && (
                        <p>
                          Task{" "}
                          <span className="font-semibold">
                            {data.task_title || "a task"}
                          </span>{" "}
                          is due tomorrow
                        </p>
                      )}

                      {/* OVERDUE */}
                      {data.type === "task_overdue" && (
                        <p className="text-red-300">
                          Task{" "}
                          <span className="font-semibold">
                            {data.task_title || "a task"}
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
          </div>,
          document.body
        )}
    </>
  );
};

export default NotificationBell;