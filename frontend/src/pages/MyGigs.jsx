// pages/MyGigs.jsx
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api/axios";
import toast from "react-hot-toast";
import {
  Briefcase, PlusCircle, Search, ArrowRight,
  IndianRupee, MapPin, Calendar, Inbox, Loader2, Clock,
  MoreVertical, XCircle, Trash2, AlertTriangle, X, ShoppingBag
} from "lucide-react";

export default function MyGigs() {
  const { user } = useSelector((s) => s.auth);
  const isClient = user.role === "client";
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [processing, setProcessing] = useState(false);

  const { data: gigs, isLoading } = useQuery({
    queryKey: ["myGigs"],
    queryFn: () => api.get("/gigs/mine").then((r) => r.data),
  });

  const filteredGigs = (gigs || []).filter((g) => {
    const matchesStatus = statusFilter === "all" || g.status === statusFilter;
    const matchesSearch =
      g.title?.toLowerCase().includes(search.toLowerCase()) ||
      g.description?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: gigs?.length || 0,
    "pending-approval": gigs?.filter((g) => g.status === "pending-approval").length || 0,
    open: gigs?.filter((g) => g.status === "open").length || 0,
    "in-progress": gigs?.filter((g) => g.status === "in-progress").length || 0,
    completed: gigs?.filter((g) => g.status === "completed").length || 0,
    cancelled: gigs?.filter((g) => g.status === "cancelled").length || 0,
  };

  const statusTabs = [
    { key: "all", label: "All" },
    ...(isClient ? [{ key: "pending-approval", label: "Pending" }] : []),
    { key: "open", label: "Open" },
    { key: "in-progress", label: "In Progress" },
    { key: "completed", label: "Completed" },
    ...(isClient ? [{ key: "cancelled", label: "Cancelled" }] : []),
  ];

  const statusStyles = {
    "pending-approval": "bg-amber-50 text-amber-700 border-amber-100",
    open: "bg-blue-50 text-blue-700 border-blue-100",
    "in-progress": "bg-indigo-50 text-indigo-700 border-indigo-100",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    cancelled: "bg-red-50 text-red-700 border-red-100",
  };

  // ==================== ACTIONS (Client Only) ====================
  const canCancel = (status) => isClient && ["pending-approval", "open", "in-progress"].includes(status);
  const canDelete = (status) => isClient && ["pending-approval", "cancelled"].includes(status);

  const handleCancel = async (gig) => {
    setProcessing(true);
    try {
      await api.put(`/gigs/${gig._id}`, { status: "cancelled" });
      toast.success("Gig cancelled successfully");
      qc.invalidateQueries(["myGigs"]);
      setConfirmAction(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel gig");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (gig) => {
    setProcessing(true);
    try {
      await api.delete(`/gigs/${gig._id}`);
      toast.success("Gig deleted permanently");
      qc.invalidateQueries(["myGigs"]);
      setConfirmAction(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete gig");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 min-h-screen bg-slate-50/40">
      
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="text-indigo-600" size={28} />
            {isClient ? "My Posted Gigs" : "My Active Jobs"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isClient
              ? "Manage and track all the gigs you've posted"
              : "Track your hired projects, milestones, and progress"}
          </p>
        </div>

        {isClient && (
          <Link
            to="/create-gig"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-105"
          >
            <PlusCircle size={18} /> Post New Gig
          </Link>
        )}

        {!isClient && (
          <Link
            to="/gigs"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-105"
          >
            <ShoppingBag size={18} /> Browse Marketplace
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or description..."
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === tab.key
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
            }`}
          >
            {tab.label}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                statusFilter === tab.key ? "bg-white/20" : "bg-slate-100"
              }`}
            >
              {statusCounts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Gigs List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
          <p className="text-sm">Loading...</p>
        </div>
      ) : filteredGigs.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center py-20 px-6">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-indigo-400" />
          </div>
          <p className="text-slate-700 font-semibold">
            {search || statusFilter !== "all"
              ? "No gigs match your filters"
              : isClient
              ? "No gigs posted yet"
              : "No active jobs yet"}
          </p>
          <p className="text-slate-400 text-sm mt-1 mb-4">
            {search || statusFilter !== "all"
              ? "Try adjusting your search or filter."
              : isClient
              ? "Start by posting your first gig to hire talented freelancers."
              : "Browse the marketplace and apply to gigs to get hired."}
          </p>
          {!search && statusFilter === "all" && (
            <Link
              to={isClient ? "/create-gig" : "/gigs"}
              className="inline-flex items-center gap-1.5 text-indigo-600 text-sm font-bold bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              {isClient ? (
                <><PlusCircle size={16} /> Post Your First Gig</>
              ) : (
                <><ShoppingBag size={16} /> Browse Marketplace</>
              )}
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGigs.map((g) => (
            <div
              key={g._id}
              className="group relative bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 hover:border-indigo-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                
                <Link to={`/gigs/${g._id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider border ${
                        statusStyles[g.status] || "bg-slate-50 text-slate-500 border-slate-200"
                      }`}
                    >
                      {g.status.replace("-", " ")}
                    </span>
                    {g.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        {g.category}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
                    {g.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                    {g.description}
                  </p>

                  {g.skillsRequired?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {g.skillsRequired.slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg capitalize"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                      <IndianRupee size={14} />
                      {g.budgetMin?.toLocaleString("en-IN")}–{g.budgetMax?.toLocaleString("en-IN")}
                    </span>
                    {g.location?.city && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={14} /> {g.location.city}
                      </span>
                    )}
                    {g.deadline && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(g.deadline).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                    {isClient && g.hiredFreelancer && (
                      <span className="inline-flex items-center gap-1 text-indigo-600 font-semibold">
                        <Clock size={14} /> Hired: {g.hiredFreelancer.name}
                      </span>
                    )}
                    {!isClient && g.client && (
                      <span className="inline-flex items-center gap-1 text-indigo-600 font-semibold">
                        <Clock size={14} /> Client: {g.client.name}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/gigs/${g._id}`}
                    className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    View <ArrowRight size={14} />
                  </Link>

                  {/* Client-only 3-dot menu */}
                  {isClient && (canCancel(g.status) || canDelete(g.status)) && (
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === g._id ? null : g._id);
                        }}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openMenuId === g._id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenMenuId(null);
                            }}
                          />
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20">
                            {canCancel(g.status) && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  setConfirmAction({ type: "cancel", gig: g });
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors"
                              >
                                <XCircle size={16} /> Cancel Gig
                              </button>
                            )}
                            {canDelete(g.status) && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  setConfirmAction({ type: "delete", gig: g });
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={16} /> Delete Permanently
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal (Client Only) */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setConfirmAction(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
              confirmAction.type === "delete" ? "bg-red-50" : "bg-amber-50"
            }`}>
              <AlertTriangle className={confirmAction.type === "delete" ? "text-red-500" : "text-amber-500"} size={28} />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              {confirmAction.type === "delete" ? "Delete this gig permanently?" : "Cancel this gig?"}
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              {confirmAction.type === "delete"
                ? `"${confirmAction.gig.title}" will be permanently removed. This action cannot be undone.`
                : `"${confirmAction.gig.title}" will be marked as cancelled and removed from the marketplace.`}
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setConfirmAction(null)}
                disabled={processing}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
              >
                Keep Gig
              </button>
              <button
                onClick={() =>
                  confirmAction.type === "delete"
                    ? handleDelete(confirmAction.gig)
                    : handleCancel(confirmAction.gig)
                }
                disabled={processing}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50 flex items-center justify-center gap-2 ${
                  confirmAction.type === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {processing ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : confirmAction.type === "delete" ? (
                  "Delete Permanently"
                ) : (
                  "Yes, Cancel Gig"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}