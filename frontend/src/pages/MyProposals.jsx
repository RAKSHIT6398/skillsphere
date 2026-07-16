import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../api/axios";
import {
  FileText,
  IndianRupee,
  Clock,
  ArrowRight,
  Inbox,
  Loader2,
  CheckCircle2,
  XCircle,
  Hourglass,
  MessageSquare,
} from "lucide-react";

export default function MyProposals() {
  const { data, isLoading } = useQuery({
    queryKey: ["myProposals"],
    queryFn: () => api.get("/proposals/mine").then((r) => r.data),
  });

  const statusConfig = {
    pending: {
      color: "bg-amber-50 text-amber-700 border-amber-100",
      icon: Hourglass,
      dot: "bg-amber-500",
    },
    accepted: {
      color: "bg-emerald-50 text-emerald-700 border-emerald-100",
      icon: CheckCircle2,
      dot: "bg-emerald-500",
    },
    rejected: {
      color: "bg-rose-50 text-rose-700 border-rose-100",
      icon: XCircle,
      dot: "bg-rose-500",
    },
    negotiating: {
      color: "bg-blue-50 text-blue-700 border-blue-100",
      icon: MessageSquare,
      dot: "bg-blue-500",
    },
  };

  // Stats
  const stats = {
    total: data?.length || 0,
    pending: data?.filter((p) => p.status === "pending").length || 0,
    accepted: data?.filter((p) => p.status === "accepted").length || 0,
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="p-6 md:p-7 bg-gradient-to-tr from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-400/20 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-indigo-500/30 text-indigo-200 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
              <FileText className="w-3 h-3" /> Applications
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">
              My Proposals
            </h1>
            <p className="text-indigo-200/80 text-sm mt-1">
              Track your gig applications & their status.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-2 text-center">
              <p className="text-xl font-black">{stats.total}</p>
              <p className="text-[10px] uppercase tracking-wide text-indigo-200">Total</p>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-2 text-center">
              <p className="text-xl font-black text-amber-300">{stats.pending}</p>
              <p className="text-[10px] uppercase tracking-wide text-indigo-200">Pending</p>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-2 text-center">
              <p className="text-xl font-black text-emerald-300">{stats.accepted}</p>
              <p className="text-[10px] uppercase tracking-wide text-indigo-200">Won</p>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
          <p className="text-sm">Loading your proposals...</p>
        </div>
      ) : !data?.length ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center py-16 px-6">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-indigo-400" />
          </div>
          <p className="text-slate-700 font-semibold">No proposals yet</p>
          <p className="text-slate-400 text-sm mt-1 mb-5">
            Browse the marketplace and apply to gigs.
          </p>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl transition"
          >
            Explore Gigs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((p) => {
            const cfg = statusConfig[p.status] || statusConfig.pending;
            const StatusIcon = cfg.icon;
            return (
              <Link
                key={p._id}
                to={`/gigs/${p.gig?._id}`}
                className="group flex items-center gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 hover:border-indigo-200 hover:shadow-md transition-all"
              >
                {/* Icon */}
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-105 transition">
                  <FileText className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate group-hover:text-indigo-600 transition">
                    {p.gig?.title || "Untitled Gig"}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {p.bidAmount}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {p.estimatedDays} days
                    </span>
                  </div>
                </div>

                {/* Status */}
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border shrink-0 ${cfg.color}`}
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  <span className="capitalize">{p.status}</span>
                </span>

                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all shrink-0 hidden sm:block" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}