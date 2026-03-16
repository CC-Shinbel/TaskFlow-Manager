import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Howl } from "howler";
import api from "../services/api";
import toast from "react-hot-toast";

interface NotificationData {
  type: string;
  [key: string]: any;
}

interface Notification {
  id: string;
  read_at: string | null;
  created_at: string;
  data: NotificationData;
}

const NotificationBell = () => {

  const soundRef = useRef<Howl | null>(null);
  const latestTimestamp = useRef<string | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* ------------------ SOUND ------------------ */

  const playSound = () => {
    if (soundRef.current) {
      soundRef.current.play();
    }
  };

  /* ------------------ INITIAL FETCH ------------------ */

  const fetchInitialNotifications = async () => {
    try {

      const response = await api.get("/notifications", {
        params: { limit: 20 }
      });

      const data: Notification[] = response.data;

      setNotifications(data);

      if (data.length > 0) {
        latestTimestamp.current = data[0].created_at;
      }

    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  /* ------------------ FETCH NEW ONLY ------------------ */

  const fetchNewNotifications = async () => {

    if (!latestTimestamp.current) return;

    try {

      const response = await api.get("/notifications", {
        params: { after: latestTimestamp.current }
      });

      const newNotifications: Notification[] = response.data;

      if (newNotifications.length === 0) return;

      playSound();

      setNotifications(prev => {

        const existingIds = new Set(prev.map(n => n.id));

        const filtered = newNotifications.filter(
          n => !existingIds.has(n.id)
        );

        return [...filtered, ...prev];

      });

      latestTimestamp.current = newNotifications[0].created_at;

    } catch (err) {
      console.error("Notification polling failed", err);
    }

  };

  /* ------------------ INIT ------------------ */

  useEffect(() => {

    soundRef.current = new Howl({
      src: ["/sound/notify.mp3"],
      volume: 0.5
    });

    fetchInitialNotifications();

    const interval = setInterval(fetchNewNotifications, 5000);

    return () => clearInterval(interval);

  }, []);

  /* ------------------ CLICK OUTSIDE ------------------ */

  useEffect(() => {

    const handleClickOutside = (event: MouseEvent) => {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }

    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);

  }, []);

  /* ------------------ DROPDOWN POSITION ------------------ */

  const toggleDropdown = () => {

    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();

    setPosition({
      top: rect.bottom + 10,
      right: window.innerWidth - rect.right
    });

    setOpen(!open);

  };

  /* ------------------ DELETE ------------------ */

  const removeNotification = async (id: string) => {

    try {

      await api.delete(`/notifications/${id}`);

      setNotifications(prev =>
        prev.filter(n => n.id !== id)
      );

    } catch {
      toast.error("Failed to delete notification");
    }

  };

  /* ------------------ MARK READ ------------------ */

  const markAsRead = async (id: string) => {

    try {

      await api.post(`/notifications/${id}/read`);

      setNotifications(prev =>
        prev.map(n =>
          n.id === id
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );

    } catch {
      toast.error("Failed to mark notification");
    }

  };

  /* ------------------ PROJECT INVITE ------------------ */

  const acceptInvite = async (inviteId: number, notificationId: string) => {

    try {

      await api.post(`/project-invites/${inviteId}/accept`);
      await api.post(`/notifications/${notificationId}/read`);

      markAsRead(notificationId);

      toast.success("Project invite accepted 🎉");

    } catch {
      toast.error("Failed to accept invite");
    }

  };

  const declineInvite = async (inviteId: number, notificationId: string) => {

    try {

      await api.post(`/project-invites/${inviteId}/decline`);
      await api.post(`/notifications/${notificationId}/read`);

      markAsRead(notificationId);

      toast("Invite declined");

    } catch {
      toast.error("Failed to decline invite");
    }

  };

  /* ------------------ TASK ASSIGNMENT ------------------ */

  const acceptAssignment = async (requestId: number, notificationId: string) => {

    try {

      await api.post(`/task-assignments/${requestId}/accept`);
      await api.post(`/notifications/${notificationId}/read`);

      markAsRead(notificationId);

      toast.success("Task accepted ✔️");

    } catch {
      toast.error("Failed to accept task");
    }

  };

  const declineAssignment = async (requestId: number, notificationId: string) => {

    try {

      await api.post(`/task-assignments/${requestId}/decline`);
      await api.post(`/notifications/${notificationId}/read`);

      markAsRead(notificationId);

      toast("Task declined");

    } catch {
      toast.error("Failed to decline task");
    }

  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  /* ------------------ UI ------------------ */

  return (
    <>
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

              <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">

                {notifications.map(notification => {

                  const data = notification.data;

                  return (

                    <div
                      key={notification.id}
                      className={`relative p-4 rounded-xl bg-white/10 text-sm text-white ${
                        notification.read_at ? "opacity-70" : ""
                      }`}
                    >

                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="absolute text-xs opacity-60 top-2 right-2 hover:opacity-100"
                      >
                        ✕
                      </button>

                      {/* PROJECT INVITE */}
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

                          {!notification.read_at && (
                            <div className="flex gap-2 mt-3">

                              <button
                                onClick={() =>
                                  acceptInvite(data.invite_id, notification.id)
                                }
                                className="px-3 py-1 text-xs font-semibold rounded-lg bg-[var(--clr-primary-a0)]"
                              >
                                Accept
                              </button>

                              <button
                                onClick={() =>
                                  declineInvite(data.invite_id, notification.id)
                                }
                                className="px-3 py-1 text-xs rounded-lg bg-white/20"
                              >
                                Decline
                              </button>

                            </div>
                          )}
                        </>
                      )}

                      {/* TASK ASSIGNMENT */}
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

                          {!notification.read_at && (
                            <div className="flex gap-2 mt-3">

                              <button
                                onClick={() =>
                                  acceptAssignment(data.request_id, notification.id)
                                }
                                className="px-3 py-1 text-xs font-semibold rounded-lg bg-[var(--clr-primary-a0)]"
                              >
                                Accept
                              </button>

                              <button
                                onClick={() =>
                                  declineAssignment(data.request_id, notification.id)
                                }
                                className="px-3 py-1 text-xs rounded-lg bg-white/20"
                              >
                                Decline
                              </button>

                            </div>
                          )}
                        </>
                      )}

                      {/* COMMENT */}
                      {data.type === "new_comment" && (
                        <p>
                          <span className="font-semibold">
                            {data.user_name}
                          </span>{" "}
                          commented on a task
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