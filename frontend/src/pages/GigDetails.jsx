import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import PayButton from "../components/PayButton";
import {
  IndianRupee, MapPin, Target, Paperclip, Calendar, CheckCircle2, Clock,
  MessageSquare, Send, Sparkles, TrendingUp, AlertTriangle, User,
  CheckSquare, Square, Plus, Briefcase, Star, BadgeCheck, ArrowRight,
  XCircle, Handshake, ShieldCheck, Loader2, Wallet,
} from "lucide-react";

const STATUS_CFG = {
  open:          { label: "Open",          bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "in-progress": { label: "In Progress",   bg: "bg-blue-50 text-blue-700 border-blue-200" },
  completed:     { label: "Completed",     bg: "bg-slate-100 text-slate-600 border-slate-200" },
  cancelled:     { label: "Cancelled",     bg: "bg-red-50 text-red-600 border-red-200" },
};

const MILESTONE_CFG = {
  pending:  "bg-slate-100 text-slate-600",
  paid:     "bg-emerald-100 text-emerald-700",
  released: "bg-emerald-100 text-emerald-700",
};

export default function GigDetails() {
  const { id } = useParams();
  const { user } = useSelector((s) => s.auth);
  const qc = useQueryClient();
  const [proposal, setProposal] = useState({ coverLetter: "", bidAmount: "", estimatedDays: "" });
  const [taskTitle, setTaskTitle] = useState("");
  const [negotiatingFor, setNegotiatingFor] = useState(null); // proposal id
  const [counterAmount, setCounterAmount] = useState("");

  const { data: gig } = useQuery({
    queryKey: ["gig", id],
    queryFn: () => api.get(`/gigs/${id}`).then((r) => r.data),
  });
  const isOwner = gig && user && gig.client._id === user._id;
  const isHired = gig && user && gig.hiredFreelancer?._id === user._id;

  const { data: proposals } = useQuery({
    queryKey: ["proposals", id],
    enabled: !!isOwner,
    queryFn: () => api.get(`/proposals/gig/${id}`).then((r) => r.data),
  });
  const { data: matches } = useQuery({
    queryKey: ["matches", id],
    enabled: !!isOwner,
    queryFn: () => api.get(`/gigs/${id}/matches`).then((r) => r.data),
  });

  const submitProposal = useMutation({
    mutationFn: () =>
      api.post("/proposals", {
        gigId: id,
        ...proposal,
        bidAmount: +proposal.bidAmount,
        estimatedDays: +proposal.estimatedDays,
      }),
    onSuccess: () => {
      toast.success("Proposal submitted! 🎉");
      setProposal({ coverLetter: "", bidAmount: "", estimatedDays: "" });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const acceptProposal = useMutation({
    mutationFn: (pid) => api.put(`/proposals/${pid}/accept`),
    onSuccess: () => {
      toast.success("Freelancer hired! 🎉");
      qc.invalidateQueries(["gig", id]);
      qc.invalidateQueries(["proposals", id]);
    },
  });

  const toggleTask = useMutation({
    mutationFn: ({ taskId, done }) => api.put(`/gigs/${id}/tasks/${taskId}`, { done }),
    onSuccess: () => qc.invalidateQueries(["gig", id]),
  });

  const addTask = useMutation({
    mutationFn: () => api.post(`/gigs/${id}/tasks`, { title: taskTitle }),
    onSuccess: () => {
      setTaskTitle("");
      qc.invalidateQueries(["gig", id]);
    },
  });

  const startChat = async (participantId) => {
    await api.post("/chat/conversations", { participantId, gigId: id });
    window.location.href = "/chat";
  };

  const sendNegotiate = (pid) => {
    if (!counterAmount) return;
    api.put(`/proposals/${pid}/negotiate`, { amount: +counterAmount, message: "Counter offer" })
      .then(() => {
        toast.success("Counter offer sent! 🤝");
        setNegotiatingFor(null);
        setCounterAmount("");
        qc.invalidateQueries(["proposals", id]);
      })
      .catch((e) => toast.error(e.response?.data?.message || "Failed"));
  };

  if (!gig) return (
    <div className="max-w-5xl mx-auto p-6 grid md:grid-cols-3 gap-6 animate-pulse">
      <div className="md:col-span-2 space-y-4">
        <div className="h-48 bg-slate-100 rounded-3xl" />
        <div className="h-40 bg-slate-100 rounded-3xl" />
      </div>
      <div className="h-64 bg-slate-100 rounded-3xl" />
    </div>
  );

  const completion = gig.tasks?.length
    ? Math.round((gig.tasks.filter((t) => t.done).length / gig.tasks.length) * 100)
    : 0;
  const statusCfg = STATUS_CFG[gig.status] || STATUS_CFG.open;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="grid lg:grid-cols-3 gap-6 items-start">

        {/* ═══════════ LEFT (MAIN) ═══════════ */}
        <div className="lg:col-span-2 space-y-5">

          {/* ── GIG HEADER CARD ── */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold mb-3 ${statusCfg.bg}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {statusCfg.label}
                  </span>
                  <h1 className="text-2xl font-extrabold text-slate-900 leading-snug">{gig.title}</h1>
                </div>
              </div>

              <p className="text-slate-600 mt-3 whitespace-pre-line leading-relaxed text-sm">
                {gig.description}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {gig.skillsRequired.map((s) => (
                  <span key={s} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">
                    {s}
                  </span>
                ))}
              </div>

              {/* Key Info Grid */}
              <div className="grid grid-cols-3 gap-3 mt-5">
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3.5 text-center">
                  <IndianRupee className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Budget</p>
                  <p className="text-sm font-extrabold text-emerald-700 mt-0.5">
                    ₹{gig.budgetMin?.toLocaleString()}–₹{gig.budgetMax?.toLocaleString()}
                  </p>
                </div>
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3.5 text-center">
                  <MapPin className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Location</p>
                  <p className="text-sm font-extrabold text-blue-700 mt-0.5">{gig.location?.city || "Remote"}</p>
                </div>
                <div className="bg-violet-50/50 border border-violet-100 rounded-2xl p-3.5 text-center">
                  <Target className="w-4 h-4 text-violet-600 mx-auto mb-1" />
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Level</p>
                  <p className="text-sm font-extrabold text-violet-700 mt-0.5 capitalize">{gig.experienceLevel}</p>
                </div>
              </div>

              {/* Attachments */}
              {gig.attachments?.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Paperclip className="w-4 h-4 text-slate-400" />
                  {gig.attachments.map((a, i) => (
                    <a key={i} href={a} target="_blank" rel="noreferrer"
                      className="text-xs text-indigo-600 font-semibold hover:underline bg-indigo-50 px-2.5 py-1 rounded-lg">
                      File {i + 1}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── MILESTONES + ESCROW ── */}
          {gig.milestones?.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Wallet className="w-4 h-4 text-indigo-600" /> Milestones & Payments
              </h2>
              <div className="space-y-3">
                {gig.milestones.map((m, i) => (
                  <div key={i}
                    className="flex items-center justify-between p-4 bg-slate-50/70 rounded-2xl border border-slate-100 hover:border-indigo-200 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0">
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">{m.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          ₹{m.amount?.toLocaleString()} • due {new Date(m.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${MILESTONE_CFG[m.status] || MILESTONE_CFG.pending}`}>
                        {m.status}
                      </span>
                      {isOwner && gig.hiredFreelancer && m.status !== "paid" && (
                        <PayButton gigId={id} milestoneIndex={i} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PROGRESS TRACKER ── */}
          {(isOwner || isHired) && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" /> Progress Tracker
                </h2>
                <span className={`text-lg font-black ${
                  completion === 100 ? "text-emerald-600" : "text-indigo-600"
                }`}>{completion}%</span>
              </div>

              {/* Animated progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-3 mb-5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    completion === 100
                      ? "bg-gradient-to-r from-emerald-500 to-green-500"
                      : "bg-gradient-to-r from-indigo-500 to-violet-500"
                  }`}
                  style={{ width: `${completion}%` }}
                />
              </div>

              {/* Task list */}
              <div className="space-y-1.5">
                {gig.tasks?.map((t) => (
                  <button
                    key={t._id}
                    onClick={() => toggleTask.mutate({ taskId: t._id, done: !t.done })}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition text-left group/task"
                  >
                    <span className={`shrink-0 transition-all ${t.done ? "text-emerald-500" : "text-slate-300 group-hover/task:text-indigo-400"}`}>
                      {t.done ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </span>
                    <span className={`text-sm transition-all ${
                      t.done ? "line-through text-slate-400" : "text-slate-700 font-medium"
                    }`}>
                      {t.title}
                    </span>
                  </button>
                ))}
              </div>

              {/* Add task */}
              <div className="flex gap-2 mt-3">
                <input
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  placeholder="Add new task..."
                  value={taskTitle}
                  onKeyDown={(e) => e.key === "Enter" && taskTitle && addTask.mutate()}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
                <button
                  onClick={() => taskTitle && addTask.mutate()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>
          )}

          {/* ── PROPOSALS (client view) ── */}
          {isOwner && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-5">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                Proposals
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                  {proposals?.length || 0}
                </span>
              </h2>

              {proposals?.length > 0 ? (
                <div className="space-y-3">
                  {proposals.map((p) => (
                    <div key={p._id}
                      className="p-5 bg-slate-50/60 border border-slate-100 rounded-2xl hover:border-indigo-200 transition">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <Link to={`/profile/${p.freelancer._id}`}
                          className="flex items-center gap-2.5 hover:no-underline group/p">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {p.freelancer.name?.[0] || "F"}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-800 group-hover/p:text-indigo-600 transition flex items-center gap-1">
                              {p.freelancer.name}
                              {p.freelancer.isVerifiedBadge && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                            </p>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {p.freelancer.reputationScore}
                            </p>
                          </div>
                        </Link>
                        <div className="text-right shrink-0">
                          <p className="font-extrabold text-emerald-600">₹{p.bidAmount?.toLocaleString()}</p>
                          <p className="text-xs text-slate-400">{p.estimatedDays} days</p>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 leading-relaxed mb-4 border-l-2 border-indigo-200 pl-3 italic">
                        "{p.coverLetter}"
                      </p>

                      {/* Inline negotiate input */}
                      {negotiatingFor === p._id && (
                        <div className="flex gap-2 mb-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                          <input
                            type="number"
                            placeholder="Counter offer ₹"
                            value={counterAmount}
                            onChange={(e) => setCounterAmount(e.target.value)}
                            className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            autoFocus
                          />
                          <button onClick={() => sendNegotiate(p._id)}
                            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">
                            Send
                          </button>
                          <button onClick={() => setNegotiatingFor(null)}
                            className="p-2 text-blue-400 hover:text-blue-600">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {p.status === "pending" && (
                          <>
                            <button
                              onClick={() => acceptProposal.mutate(p._id)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                            </button>
                            <button
                              onClick={() => api.put(`/proposals/${p._id}/reject`).then(() => qc.invalidateQueries(["proposals", id]))}
                              className="px-4 py-2 bg-white border border-slate-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition">
                              Reject
                            </button>
                            <button
                              onClick={() => setNegotiatingFor(p._id)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition">
                              <Handshake className="w-3.5 h-3.5" /> Negotiate
                            </button>
                          </>
                        )}
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                          p.status === "accepted" ? "bg-emerald-100 text-emerald-700" :
                          p.status === "rejected" ? "bg-red-100 text-red-600" :
                          "bg-slate-100 text-slate-600"
                        }`}>{p.status}</span>
                        <button
                          onClick={() => startChat(p.freelancer._id)}
                          className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition">
                          <MessageSquare className="w-3.5 h-3.5" /> Chat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <Briefcase className="w-10 h-10 mx-auto mb-2 text-slate-200" />
                  <p className="text-sm font-semibold">No proposals yet</p>
                  <p className="text-xs mt-1">Freelancers will appear here</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══════════ RIGHT SIDEBAR ═══════════ */}
        <div className="space-y-4 lg:sticky lg:top-6">

          {/* ── SUBMIT PROPOSAL (freelancer) ── */}
          {user?.role === "freelancer" && gig.status === "open" && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white">
                <h2 className="font-bold flex items-center gap-2">
                  <Send className="w-4 h-4" /> Submit Proposal
                </h2>
                <p className="text-indigo-200/80 text-xs mt-1">Stand out with a compelling pitch</p>
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); submitProposal.mutate(); }}
                className="p-5 space-y-3"
              >
                <textarea
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition"
                  rows={4}
                  placeholder="Why are you the best fit? Share your experience..."
                  required
                  maxLength={1000}
                  value={proposal.coverLetter}
                  onChange={(e) => setProposal({ ...proposal, coverLetter: e.target.value })}
                />
                <div className="text-xs text-slate-400 text-right">{proposal.coverLetter.length}/1000</div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                      type="number"
                      placeholder="Bid amount"
                      required
                      value={proposal.bidAmount}
                      onChange={(e) => setProposal({ ...proposal, bidAmount: e.target.value })}
                    />
                  </div>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                      type="number"
                      placeholder="Days needed"
                      required
                      value={proposal.estimatedDays}
                      onChange={(e) => setProposal({ ...proposal, estimatedDays: e.target.value })}
                    />
                  </div>
                </div>

                {/* Budget hint */}
                {proposal.bidAmount && (
                  <p className={`text-xs font-semibold px-3 py-2 rounded-xl ${
                    +proposal.bidAmount < gig.budgetMin
                      ? "bg-amber-50 text-amber-700"
                      : +proposal.bidAmount > gig.budgetMax
                      ? "bg-red-50 text-red-600"
                      : "bg-emerald-50 text-emerald-700"
                  }`}>
                    {+proposal.bidAmount < gig.budgetMin
                      ? `⚠️ Below min budget (₹${gig.budgetMin?.toLocaleString()})`
                      : +proposal.bidAmount > gig.budgetMax
                      ? `⚠️ Above max budget (₹${gig.budgetMax?.toLocaleString()})`
                      : "✅ Within budget range"}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitProposal.isPending}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-2xl transition shadow-md shadow-indigo-200 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {submitProposal.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {submitProposal.isPending ? "Sending..." : "Send Proposal"}
                </button>
              </form>
            </div>
          )}

          {/* ── AI MATCHES (client) ── */}
          {isOwner && matches && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-violet-500" /> AI-Matched Freelancers
              </h2>
              <div className="space-y-3">
                {matches.map(({ freelancer: f, score }) => (
                  <div key={f._id}
                    className="flex items-center justify-between p-3 bg-slate-50/70 rounded-2xl border border-slate-100 hover:border-violet-200 transition">
                    <Link to={`/profile/${f._id}`} className="flex items-center gap-2.5 min-w-0 group/m">
                      <div className="w-9 h-9 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {f.name?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-800 group-hover/m:text-violet-600 transition truncate flex items-center gap-1">
                          {f.name}
                          {f.isVerifiedBadge && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          {f.reputationScore} • ₹{f.hourlyRate}/hr
                        </p>
                      </div>
                    </Link>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                        score >= 0.7 ? "bg-emerald-100 text-emerald-700" :
                        score >= 0.4 ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {Math.round(score * 100)}% match
                      </span>
                      <button
                        onClick={() => api.post(`/gigs/${id}/invite/${f._id}`).then(() => toast.success("Invited! 🎉"))}
                        className="text-[11px] font-bold text-violet-600 hover:text-violet-700 hover:underline transition">
                        Invite →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CLIENT CARD ── */}
          {gig.client && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-3">Posted By</p>
              <Link to={`/profile/${gig.client._id}`} className="flex items-center gap-3 group/c">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shrink-0 group-hover/c:scale-105 transition-transform">
                  {gig.client.avatar ? (
                    <img src={gig.client.avatar} className="w-full h-full object-cover rounded-2xl" alt="" />
                  ) : (
                    gig.client.name?.[0]
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm flex items-center gap-1">
                    {gig.client.name}
                    {gig.client.isVerifiedBadge && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                  </p>
                  <p className="text-xs text-slate-400 capitalize">{gig.client.role}</p>
                </div>
              </Link>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Payment secured via SkillSphere Escrow
              </div>
            </div>
          )}

          {/* ── ACTION BUTTONS ── */}
          {(isHired || isOwner) && gig.hiredFreelancer && (
            <button
              onClick={() => startChat(isOwner ? gig.hiredFreelancer._id : gig.client._id)}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Message {isOwner ? "Freelancer" : "Client"}
            </button>
          )}

          {(isHired || isOwner) && (
            <Link
              to="/disputes"
              className="flex items-center justify-center gap-2 w-full py-3 border border-red-200 text-red-600 font-semibold text-sm rounded-2xl hover:bg-red-50 transition"
            >
              <AlertTriangle className="w-4 h-4" /> Raise a Dispute
            </Link>
          )}

          {/* ── HIRED FREELANCER BADGE ── */}
          {gig.hiredFreelancer && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-800">Freelancer Hired</p>
                <Link
                  to={`/profile/${gig.hiredFreelancer._id}`}
                  className="text-sm font-extrabold text-emerald-700 hover:underline"
                >
                  {gig.hiredFreelancer.name}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}