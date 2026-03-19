import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Howl } from "howler";
import { useNavigate } from "react-router-dom";
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

  const navigate = useNavigate();

  const soundRef = useRef<Howl | null>(null);
  const latestTimestamp = useRef<string | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allowedTypes = ["new_comment", "deadline"];

  /* ------------------ SOUND ------------------ */

  const playSound = () => {
    soundRef.current?.play();
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

  /* ------------------ FETCH NEW ------------------ */

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
        const filtered = newNotifications.filter(n => !existingIds.has(n.id));
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

  /* ------------------ DROPDOWN ------------------ */

  const toggleDropdown = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();

    setPosition({
      top: rect.bottom + 10,
      right: window.innerWidth - rect.right
    });

    setOpen(!open);
  };

  /* ------------------ MARK SINGLE ------------------ */

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

  /* ------------------ MARK ALL (FILTERED) ------------------ */

  const markAllAsRead = async () => {
    try {

      const toMark = notifications.filter(
        n => !n.read_at && allowedTypes.includes(n.data.type)
      );

      await Promise.all(
        toMark.map(n => api.post(`/notifications/${n.id}/read`))
      );

      setNotifications(prev =>
        prev.map(n =>
          allowedTypes.includes(n.data.type)
            ? { ...n, read_at: n.read_at || new Date().toISOString() }
            : n
        )
      );

      toast.success("Notifications marked as read");

    } catch {
      toast.error("Failed to mark notifications");
    }
  };

  /* ------------------ ACTIONS ------------------ */

  const removeNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    const data = notification.data;

    try {
      if (!notification.read_at && allowedTypes.includes(data.type)) {
        await markAsRead(notification.id);
      }

      if (data.type === "new_comment" && data.project_id) {
        navigate(`/projects/${data.project_id}`);
      }

    } catch (err) {
      console.error(err);
    }
  };

  /* ------------------ INVITES / ASSIGNMENTS ------------------ */

  const acceptInvite = async (id: number, notifId: string) => {
    await api.post(`/project-invites/${id}/accept`);
    await markAsRead(notifId);
    toast.success("Accepted 🎉");
  };

  const declineInvite = async (id: number, notifId: string) => {
    await api.post(`/project-invites/${id}/decline`);
    await markAsRead(notifId);
  };

  const acceptAssignment = async (id: number, notifId: string) => {
    await api.post(`/task-assignments/${id}/accept`);
    await markAsRead(notifId);
  };

  const declineAssignment = async (id: number, notifId: string) => {
    await api.post(`/task-assignments/${id}/decline`);
    await markAsRead(notifId);
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  /* ------------------ UI ------------------ */

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="relative p-2 text-white rounded-full hover:bg-white/20"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute w-5 h-5 text-xs flex items-center justify-center rounded-full -top-1 -right-1 bg-[var(--clr-primary-a0)]">
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

            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Notifications
              </h3>

              <button
                onClick={markAllAsRead}
                className="px-3 py-1 text-xs text-white rounded-lg bg-white/20 hover:bg-white/30"
              >
                Mark all as Read
              </button>
            </div>

            {/* LIST */}
            <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">

              {notifications.map(n => {
                const d = n.data;
                const isUnread = !n.read_at;
                const isMarkable = allowedTypes.includes(d.type);

                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`relative p-4 rounded-xl text-sm text-white cursor-pointer transition
                      ${
                        isUnread
                          ? "bg-white/20 border border-[var(--clr-primary-a0)]/40"
                          : "bg-white/10 opacity-70"
                      }
                    `}
                  >

                    {/* DOT */}
                    {isUnread && (
                      <span className="absolute w-2 h-2 bg-[var(--clr-primary-a0)] rounded-full top-2 left-2" />
                    )}

                    {/* DELETE */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(n.id);
                      }}
                      className="absolute text-xs top-2 right-2 opacity-60"
                    >
                      ✕
                    </button>

                    {/* CONTENT */}
                    <p className={isUnread ? "font-medium" : ""}>
                      {d.type === "new_comment" && (
                        <>
                          <span className="font-semibold">{d.user_name}</span> commented
                        </>
                      )}

                      {d.type === "project_invite" && (
                        <>
                          <span className="font-semibold">{d.project_name}</span> invite
                        </>
                      )}

                      {d.type === "task_assignment" && (
                        <>
                          Assigned: <span className="font-semibold">{d.task_title}</span>
                        </>
                      )}
                    </p>

                    {/* MARK AS READ (ONLY ALLOWED TYPES) */}
                    {isUnread && isMarkable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(n.id);
                        }}
                        className="px-2 py-1 mt-2 text-xs rounded-lg bg-white/20 hover:bg-white/30"
                      >
                        Mark as read
                      </button>
                    )}

                    {/* ACTIONS */}
                    {d.type === "project_invite" && isUnread && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={(e)=>{e.stopPropagation();acceptInvite(d.invite_id,n.id)}} className="px-2 py-1 text-xs bg-[var(--clr-primary-a0)] rounded-lg">Accept</button>
                        <button onClick={(e)=>{e.stopPropagation();declineInvite(d.invite_id,n.id)}} className="px-2 py-1 text-xs rounded-lg bg-white/20">Decline</button>
                      </div>
                    )}

                    {d.type === "task_assignment" && isUnread && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={(e)=>{e.stopPropagation();acceptAssignment(d.request_id,n.id)}} className="px-2 py-1 text-xs bg-[var(--clr-primary-a0)] rounded-lg">Accept</button>
                        <button onClick={(e)=>{e.stopPropagation();declineAssignment(d.request_id,n.id)}} className="px-2 py-1 text-xs rounded-lg bg-white/20">Decline</button>
                      </div>
                    )}

                  </div>
                );
              })}

            </div>

          </div>,
          document.body
        )}
    </>
  );
};

export default NotificationBell;