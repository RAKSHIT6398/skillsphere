// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Link } from "react-router-dom";
// import api from "../api/axios";
// import { setNotifications, markAllRead } from "../features/notificationSlice";

// export default function Notifications() {
//   const dispatch = useDispatch();
//   const { items } = useSelector((s) => s.notifications);
//   useEffect(() => { api.get("/notifications").then((r) => dispatch(setNotifications(r.data))); }, [dispatch]);

//   const icons = { "new-gig": "💼", "proposal-accepted": "🎉", "proposal-received": "📩", payment: "💰", review: "⭐", message: "💬", dispute: "⚠️", system: "🔔" };

//   return (
//     <div className="max-w-2xl mx-auto p-6">
//       <div className="flex justify-between mb-4">
//         <h1 className="text-2xl font-bold">Notifications</h1>
//         <button className="text-sm text-brand-600" onClick={() => { api.put("/notifications/read-all"); dispatch(markAllRead()); }}>Mark all read</button>
//       </div>
//       <div className="card divide-y">
//         {items.map((n) => (
//           <Link key={n._id} to={n.link || "#"} className={`block py-3 ${!n.isRead ? "bg-blue-50/60 -mx-5 px-5" : ""}`}>
//             <p className="font-medium">{icons[n.type]} {n.title}</p>
//             <p className="text-sm text-gray-500">{n.body}</p>
//             <p className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
//           </Link>
//         ))}
//         {!items.length && <p className="text-gray-400 py-6 text-center">No notifications.</p>}
//       </div>
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import {
  setNotifications,
  markAllRead,
} from "../features/notificationSlice";
import {
  Bell,
  Briefcase,
  PartyPopper,
  Mail,
  IndianRupee,
  Star,
  MessageSquare,
  AlertTriangle,
  Trash2,
  CheckCheck,
  Loader2,
} from "lucide-react";

export default function Notifications() {
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.notifications);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    api
      .get("/notifications")
      .then((r) => dispatch(setNotifications(r.data)))
      .finally(() => setLoading(false));
  }, [dispatch]);

  // Icon + color per notification type
  const meta = {
    "new-gig": { icon: Briefcase, color: "text-indigo-600 bg-indigo-50" },
    "proposal-accepted": { icon: PartyPopper, color: "text-emerald-600 bg-emerald-50" },
    "proposal-received": { icon: Mail, color: "text-blue-600 bg-blue-50" },
    payment: { icon: IndianRupee, color: "text-emerald-600 bg-emerald-50" },
    review: { icon: Star, color: "text-amber-600 bg-amber-50" },
    message: { icon: MessageSquare, color: "text-violet-600 bg-violet-50" },
    dispute: { icon: AlertTriangle, color: "text-rose-600 bg-rose-50" },
    system: { icon: Bell, color: "text-slate-600 bg-slate-100" },
  };

  const getMeta = (type) => meta[type] || meta.system;

  const unreadCount = items.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    api.put("/notifications/read-all");
    dispatch(markAllRead());
    toast.success("All marked as read");
  };

  // Delete single notification
  const deleteOne = async (e, id) => {
    e.preventDefault(); // stop Link navigation
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      dispatch(setNotifications(items.filter((n) => n._id !== id)));
      toast.success("Notification deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  // Clear all notifications
  const clearAll = async () => {
    if (!window.confirm("Delete all notifications? This cannot be undone.")) return;
    setClearing(true);
    try {
      await api.delete("/notifications/clear");
      dispatch(setNotifications([]));
      toast.success("All notifications cleared");
    } catch {
      toast.error("Failed to clear");
    } finally {
      setClearing(false);
    }
  };

  // Relative time helper
  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="relative">
              <Bell className="w-6 h-6 text-indigo-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </span>
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-xs text-slate-400 mt-0.5">
              You have {unreadCount} unread
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl transition"
            >
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
          {items.length > 0 && (
            <button
              onClick={clearAll}
              disabled={clearing}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl transition disabled:opacity-60"
            >
              {clearing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-600 mb-2" />
          <p className="text-sm">Loading notifications...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm text-center py-16 px-6">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-600 font-semibold">You're all caught up!</p>
          <p className="text-slate-400 text-sm mt-1">No notifications right now.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((n) => {
            const { icon: Icon, color } = getMeta(n.type);
            return (
              <Link
                key={n._id}
                to={n.link || "#"}
                className={`group relative flex items-start gap-3 p-4 rounded-2xl border transition-all ${
                  !n.isRead
                    ? "bg-indigo-50/40 border-indigo-100 hover:bg-indigo-50/70"
                    : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
                }`}
              >
                {/* Unread dot */}
                {!n.isRead && (
                  <span className="absolute top-4 right-4 w-2 h-2 bg-indigo-500 rounded-full" />
                )}

                {/* Icon */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                  <p
                    className={`text-sm truncate ${
                      !n.isRead
                        ? "font-bold text-slate-900"
                        : "font-semibold text-slate-700"
                    }`}
                  >
                    {n.title}
                  </p>
                  <p className="text-sm text-slate-500 line-clamp-2 mt-0.5">
                    {n.body}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    {timeAgo(n.createdAt)}
                  </p>
                </div>

                {/* Delete button (shows on hover) */}
                <button
                  onClick={(e) => deleteOne(e, n._id)}
                  className="absolute bottom-3 right-3 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}