import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import api from "../api/axios";
import toast from "react-hot-toast";
import {
  Wallet, TrendingUp, Lock, CheckCircle2, XCircle, Clock, 
  IndianRupee, Search, Loader2, CreditCard, ShieldCheck, RefreshCw, 
  Send, Calendar, User, ChevronRight, Sparkles, AlertCircle,
  ChevronLeft, ChevronsLeft, ChevronsRight, ArrowDown, ArrowUp,
  Filter, SortAsc
} from "lucide-react";

export default function Payments() {
  const { user } = useSelector((s) => s.auth);
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  
  // ==================== PAGINATION STATE ====================
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState("desc"); // desc = latest first
  const [viewMode, setViewMode] = useState("grouped"); // "grouped" or "list"

  const { data: payments, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: () => api.get("/payments/history").then((r) => r.data),
  });

  const isClient = user.role === "client";
  const isFreelancer = user.role === "freelancer";

  const act = async (id, action) => {
    setActionLoading(`${id}-${action}`);
    try {
      await api.put(`/payments/${id}/${action}`);
      toast.success(
        action === "release" 
          ? "Payment released to freelancer! 🎉" 
          : "Refund processed successfully!"
      );
      qc.invalidateQueries(["payments"]);
    } catch (e) {
      toast.error(e.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  // ==================== STATS ====================
  const totalEscrowed = payments?.filter(p => p.status === "escrowed").reduce((s, p) => s + p.amount, 0) || 0;
  const totalReleased = payments?.filter(p => p.status === "released").reduce((s, p) => s + (isFreelancer ? p.amount - (p.platformFee || 0) : p.amount), 0) || 0;
  const totalRefunded = payments?.filter(p => p.status === "refunded").reduce((s, p) => s + p.amount, 0) || 0;
  const totalPending = payments?.filter(p => p.status === "created").reduce((s, p) => s + p.amount, 0) || 0;

  // ==================== FILTER + SORT + PAGINATE ====================
  const filteredAndSorted = useMemo(() => {
    let result = payments?.filter(p => {
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      const matchesSearch = p.gig?.title?.toLowerCase().includes(search.toLowerCase()) ||
                           p.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
                           p.freelancer?.name?.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    }) || [];

    // Sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [payments, statusFilter, search, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedPayments = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [statusFilter, search, itemsPerPage]);

  // ==================== GROUP BY DATE ====================
  const groupedPayments = useMemo(() => {
    const groups = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    paginatedPayments.forEach(p => {
      const date = new Date(p.createdAt);
      let group;
      
      if (date >= today) group = "Today";
      else if (date >= yesterday) group = "Yesterday";
      else if (date >= weekAgo) group = "This Week";
      else if (date >= monthAgo) group = "This Month";
      else group = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

      if (!groups[group]) groups[group] = [];
      groups[group].push(p);
    });

    return groups;
  }, [paginatedPayments]);

  const statusOptions = [
    { value: "all", label: "All", count: payments?.length || 0, color: "slate" },
    { value: "escrowed", label: "In Escrow", count: payments?.filter(p => p.status === "escrowed").length || 0, color: "amber" },
    { value: "released", label: "Released", count: payments?.filter(p => p.status === "released").length || 0, color: "emerald" },
    { value: "created", label: "Pending", count: payments?.filter(p => p.status === "created").length || 0, color: "blue" },
    { value: "refunded", label: "Refunded", count: payments?.filter(p => p.status === "refunded").length || 0, color: "red" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* ==================== HEADER (Same as before) ==================== */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 shadow-2xl shadow-emerald-500/20">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl" />

          <div className="relative p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="text-white">
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 mb-3">
                <ShieldCheck size={12} /> Secure Payments
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-3">
                <Wallet className="w-8 h-8" />
                Transaction History
              </h1>
              <p className="mt-2 text-emerald-100 text-base sm:text-lg">
                {isClient ? "Track payments and manage escrow releases" : "View your earnings and payment history"}
              </p>
            </div>

            <div className="hidden sm:flex flex-col items-end text-white">
              <p className="text-xs font-semibold text-emerald-200 uppercase tracking-widest">
                {isFreelancer ? "Total Earned" : "Total Spent"}
              </p>
              <p className="text-4xl font-black mt-1">
                ₹{(totalReleased + totalEscrowed).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* ==================== STATS GRID ==================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Lock size={22} />} label="In Escrow" value={totalEscrowed} color="amber"
            trend={payments?.filter(p => p.status === "escrowed").length || 0} trendLabel="active" />
          <StatCard icon={<CheckCircle2 size={22} />} label={isFreelancer ? "Total Earned" : "Total Paid"} value={totalReleased} color="emerald"
            trend={payments?.filter(p => p.status === "released").length || 0} trendLabel="completed" />
          <StatCard icon={<Clock size={22} />} label="Pending" value={totalPending} color="blue"
            trend={payments?.filter(p => p.status === "created").length || 0} trendLabel="pending" />
          <StatCard icon={<RefreshCw size={22} />} label="Refunded" value={totalRefunded} color="red"
            trend={payments?.filter(p => p.status === "refunded").length || 0} trendLabel="refunds" />
        </div>

        {/* ==================== FILTERS ==================== */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {statusOptions.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border-2 ${
                  statusFilter === s.value
                    ? `border-${s.color}-500 bg-${s.color}-50 text-${s.color}-700 shadow-md`
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {s.label}
                <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-black ${
                  statusFilter === s.value ? `bg-${s.color}-100` : "bg-slate-100"
                }`}>
                  {s.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ==================== TOOLBAR (View Mode + Sort + Per Page) ==================== */}
        {filteredAndSorted.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="font-semibold">
                Showing <span className="text-slate-900 font-bold">{((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredAndSorted.length)}</span> of{" "}
                <span className="text-slate-900 font-bold">{filteredAndSorted.length}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* View Mode Toggle */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode("grouped")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === "grouped" 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  📅 Grouped
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === "list" 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  📋 List
                </button>
              </div>

              {/* Sort Toggle */}
              <button
                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 transition-all"
              >
                {sortOrder === "desc" ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                {sortOrder === "desc" ? "Newest First" : "Oldest First"}
              </button>

              {/* Items Per Page */}
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 outline-none cursor-pointer hover:border-slate-300"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        )}

        {/* ==================== TRANSACTIONS LIST ==================== */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
            <p className="text-sm font-medium">Loading transactions...</p>
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <EmptyState search={search} statusFilter={statusFilter} />
        ) : viewMode === "grouped" ? (
          <div className="space-y-6">
            {Object.entries(groupedPayments).map(([groupName, groupPayments]) => (
              <div key={groupName} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <h3 className="font-black text-slate-900 text-sm">{groupName}</h3>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {groupPayments.length}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">
                    ₹{groupPayments.reduce((s, p) => s + p.amount, 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {groupPayments.map(p => (
                    <TransactionRow 
                      key={p._id} 
                      payment={p} 
                      userRole={user.role}
                      onAction={act}
                      actionLoading={actionLoading}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {paginatedPayments.map(p => (
                <TransactionRow 
                  key={p._id} 
                  payment={p} 
                  userRole={user.role}
                  onAction={act}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          </div>
        )}

        {/* ==================== PAGINATION ==================== */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* ==================== INFO CARD ==================== */}
        <div className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-3xl p-6 flex items-start gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-1">🔒 Secure Escrow Protection</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isClient 
                ? "Your payments are held safely in escrow until you approve milestone completion."
                : "Your earnings are protected in escrow. Funds are released within 24 hours of approval."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== PAGINATION COMPONENT ====================
function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
      {/* First Page */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        title="First page"
      >
        <ChevronsLeft size={16} className="text-slate-600" />
      </button>

      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        title="Previous page"
      >
        <ChevronLeft size={16} className="text-slate-600" />
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((page, idx) => (
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 font-bold">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[40px] h-10 rounded-xl font-bold text-sm transition-all ${
              currentPage === page
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 scale-105"
                : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {page}
          </button>
        )
      ))}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        title="Next page"
      >
        <ChevronRight size={16} className="text-slate-600" />
      </button>

      {/* Last Page */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        title="Last page"
      >
        <ChevronsRight size={16} className="text-slate-600" />
      </button>
    </div>
  );
}

// ==================== STAT CARD ====================
function StatCard({ icon, label, value, color, trend, trendLabel }) {
  const gradients = {
    amber: "from-amber-500 to-orange-600 shadow-amber-500/30",
    emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/30",
    blue: "from-blue-500 to-cyan-600 shadow-blue-500/30",
    red: "from-red-500 to-pink-600 shadow-red-500/30",
  };

  const glowColors = {
    amber: "bg-amber-500/10",
    emerald: "bg-emerald-500/10",
    blue: "bg-blue-500/10",
    red: "bg-red-500/10",
  };

  return (
    <div className="group relative bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <div className={`absolute -top-6 -right-6 w-24 h-24 ${glowColors[color]} rounded-full blur-2xl group-hover:scale-125 transition-transform`} />
      <div className="relative">
        <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${gradients[color]} text-white shadow-lg`}>
          {icon}
        </div>
        <p className="text-3xl font-black text-slate-900 mt-4 leading-none">
          ₹{value.toLocaleString('en-IN')}
        </p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
          <span className={`text-[10px] font-bold text-${color}-600 bg-${color}-50 px-2 py-0.5 rounded-full`}>
            {trend} {trendLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

// ==================== TRANSACTION ROW ====================
function TransactionRow({ payment: p, userRole, onAction, actionLoading }) {
  const isClient = userRole === "client";
  const isFreelancer = userRole === "freelancer";

  const statusConfig = {
    created: { color: "blue", icon: Clock, label: "Pending" },
    escrowed: { color: "amber", icon: Lock, label: "In Escrow" },
    released: { color: "emerald", icon: CheckCircle2, label: "Released" },
    refunded: { color: "red", icon: RefreshCw, label: "Refunded" },
    failed: { color: "red", icon: XCircle, label: "Failed" },
  };

  const config = statusConfig[p.status] || statusConfig.created;
  const Icon = config.icon;
  const isIncoming = (isFreelancer && p.status === "released") || (isClient && p.status === "refunded");
  const netAmount = isFreelancer && p.status === "released" ? p.amount - (p.platformFee || 0) : p.amount;

  return (
    <div className="p-5 hover:bg-slate-50/50 transition-colors">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`hidden sm:flex w-12 h-12 rounded-2xl bg-${config.color}-50 items-center justify-center flex-shrink-0 border border-${config.color}-100`}>
            <Icon className={`w-5 h-5 text-${config.color}-600`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 truncate">{p.gig?.title || "Untitled"}</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                <Sparkles size={10} /> Milestone #{(p.milestoneIndex ?? 0) + 1}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <User size={11} />
                <span className="font-medium">{p.client?.name}</span>
                <ChevronRight size={10} className="text-slate-300" />
                <span className="font-medium text-emerald-600">{p.freelancer?.name}</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1">
                <Calendar size={11} />
                <span>{new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className={`text-lg font-black ${isIncoming ? 'text-emerald-600' : 'text-slate-900'}`}>
              {isIncoming ? '+' : ''}₹{netAmount.toLocaleString('en-IN')}
            </p>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-${config.color}-700 bg-${config.color}-50 px-2 py-0.5 rounded-full border border-${config.color}-100`}>
              <Icon size={10} /> {config.label}
            </span>
          </div>

          {isClient && p.status === "escrowed" && (
            <div className="hidden md:flex gap-2">
              <button
                onClick={() => onAction(p._id, "release")}
                disabled={actionLoading === `${p._id}-release`}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 disabled:opacity-60"
              >
                {actionLoading === `${p._id}-release` ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Send size={12} /> Release</>}
              </button>
              <button
                onClick={() => onAction(p._id, "refund")}
                disabled={actionLoading === `${p._id}-refund`}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-60"
              >
                {actionLoading === `${p._id}-refund` ? <Loader2 className="w-3 h-3 animate-spin" /> : <><RefreshCw size={12} /> Refund</>}
              </button>
            </div>
          )}
        </div>
      </div>

      {isClient && p.status === "escrowed" && (
        <div className="md:hidden flex gap-2 mt-3">
          <button
            onClick={() => onAction(p._id, "release")}
            disabled={actionLoading === `${p._id}-release`}
            className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {actionLoading === `${p._id}-release` ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Send size={12} /> Release</>}
          </button>
          <button
            onClick={() => onAction(p._id, "refund")}
            disabled={actionLoading === `${p._id}-refund`}
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {actionLoading === `${p._id}-refund` ? <Loader2 className="w-3 h-3 animate-spin" /> : <><RefreshCw size={12} /> Refund</>}
          </button>
        </div>
      )}
    </div>
  );
}

// ==================== EMPTY STATE ====================
function EmptyState({ search, statusFilter }) {
  if (search) {
    return (
      <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center py-20">
        <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-700 font-semibold text-lg">No transactions found</p>
        <p className="text-slate-400 text-sm mt-1">Try different search terms.</p>
      </div>
    );
  }

  if (statusFilter !== "all") {
    return (
      <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center py-20">
        <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-700 font-semibold text-lg">No {statusFilter} transactions</p>
        <p className="text-slate-400 text-sm mt-1">Try a different filter.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center py-20">
      <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
        <Wallet className="w-10 h-10 text-emerald-400" />
      </div>
      <p className="text-slate-700 font-bold text-xl mb-2">No transactions yet</p>
      <p className="text-slate-500 text-sm max-w-md mx-auto">
        Your transaction history will appear here once payments are made.
      </p>
    </div>
  );
}