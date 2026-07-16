import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../api/axios";
import {
  Sparkles,
  Briefcase,
  TrendingUp,
  User,
  Clock,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  PlusCircle,
  ShoppingBag,
  Inbox,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useSelector((s) => s.auth);

  const { data: myGigs, isLoading: gigsLoading } = useQuery({
    queryKey: ["myGigs"],
    queryFn: () => api.get("/gigs/mine").then((r) => r.data),
  });

  const { data: recommended, isLoading: recLoading } = useQuery({
    queryKey: ["recommended"],
    enabled: user?.role === "freelancer",
    queryFn: () => api.get("/gigs/recommended").then((r) => r.data),
  });

  const { data: profile } = useQuery({
    queryKey: ["myProfile", user?._id],
    enabled: user?.role === "freelancer" && !!user?._id,
    queryFn: () => api.get(`/users/${user._id}`).then((r) => r.data),
  });

  const { data: trending } = useQuery({
    queryKey: ["trending"],
    queryFn: () => api.get("/gigs/trending-skills").then((r) => r.data),
  });

  const hasSkills = (profile?.skills?.length || 0) > 0;

  const openCount = myGigs?.filter((g) => g.status === "open").length || 0;
  const inProgressCount =
    myGigs?.filter((g) => g.status === "in-progress").length || 0;
  const completedCount =
    myGigs?.filter((g) => g.status === "completed").length || 0;
  const aiMatchCount = recommended?.length || 0;

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const stats = [
    {
      value: inProgressCount,
      label: user?.role === "client" ? "Active Gigs" : "Active Jobs",
      icon: Briefcase,
      from: "from-indigo-500",
      to: "to-indigo-600",
      shadow: "shadow-indigo-500/30",
      blob: "bg-indigo-500/5",
    },
    {
      value: openCount,
      label: user?.role === "client" ? "Open Gigs" : "Open Bids",
      icon: ArrowRight,
      from: "from-emerald-500",
      to: "to-emerald-600",
      shadow: "shadow-emerald-500/30",
      blob: "bg-emerald-500/5",
    },
    ...(user?.role === "freelancer"
      ? [
          {
            value: aiMatchCount,
            label: "AI Matches",
            icon: Sparkles,
            from: "from-purple-500",
            to: "to-purple-600",
            shadow: "shadow-purple-500/30",
            blob: "bg-purple-500/5",
          },
        ]
      : []),
    {
      value: completedCount,
      label: "Completed",
      icon: CheckCircle2,
      from: "from-amber-500",
      to: "to-amber-600",
      shadow: "shadow-amber-500/30",
      blob: "bg-amber-500/5",
    },
  ];

  return (
    <div className="page">
      <div className="container-app space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              {greeting},{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent break-words">
                {user?.name?.split(" ")[0] || "User"}
              </span>
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-slate-500 font-medium">
              <span className="capitalize inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm text-slate-700">
                <User size={14} className="text-indigo-500" />
                {user?.role || "member"} Dashboard
              </span>
              <span className="inline-flex items-center gap-1.5 text-indigo-800">
                <Clock size={16} />
                <span className="truncate">{today}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="relative overflow-hidden bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-3 sm:gap-4 group"
            >
              <div
                className={`absolute top-0 right-0 w-20 h-20 ${s.blob} rounded-full -mr-6 -mt-6 group-hover:scale-150 transition-transform duration-500`}
              />
              <div
                className={`p-2.5 sm:p-3 bg-gradient-to-br ${s.from} ${s.to} rounded-xl text-white shadow-lg ${s.shadow} relative z-10 shrink-0`}
              >
                <s.icon size={18} />
              </div>
              <div className="relative z-10 min-w-0">
                <p className="text-xl sm:text-2xl font-black text-slate-900">
                  {s.value}
                </p>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-400 mt-0.5 truncate">
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* AI recommended */}
            {user?.role === "freelancer" && (
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-indigo-50/50 to-purple-50/30">
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/30 shrink-0">
                      <Sparkles size={18} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base">
                        AI-Recommended Gigs
                      </h2>
                      <p className="text-xs font-medium text-slate-400 mt-0.5">
                        Best matching jobs based on your expertise
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/gigs"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 shrink-0"
                  >
                    View all <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="p-4 sm:p-6">
                  {recLoading ? (
                    <div className="text-center py-8 text-slate-400">
                      <Clock className="mx-auto mb-2 text-slate-300 animate-pulse" size={26} />
                      <p className="text-sm font-medium">Loading recommendations...</p>
                    </div>
                  ) : recommended?.length ? (
                    <div className="divide-y divide-slate-100">
                      {recommended.map(({ gig, score }) => (
                        <Link
                          key={gig._id}
                          to={`/gigs/${gig._id}`}
                          className="block py-4 first:pt-0 last:pb-0 group"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl hover:bg-slate-50/80 transition-colors p-2 sm:p-3 -mx-2 sm:-mx-3">
                            <div className="space-y-2 min-w-0">
                              <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm sm:text-base line-clamp-2">
                                {gig.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                                  ₹{gig.budgetMin?.toLocaleString("en-IN")} – ₹
                                  {gig.budgetMax?.toLocaleString("en-IN")}
                                </span>
                                {gig.skillsRequired?.slice(0, 4).map((skill) => (
                                  <span
                                    key={skill}
                                    className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/50 capitalize"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <span className="self-start sm:self-center text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white inline-flex items-center gap-1 shadow-md shadow-emerald-500/30 shrink-0">
                              ✨ {Math.round((score || 0) * 100)}% Match
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : !hasSkills ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <AlertCircle className="text-amber-500" size={28} />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">
                        Add skills to get AI recommendations
                      </p>
                      <p className="text-xs text-slate-500 mb-4">
                        We'll match you with the perfect gigs based on your expertise.
                      </p>
                      <Link
                        to="/edit-profile"
                        className="inline-flex items-center gap-1.5 text-indigo-600 text-xs font-bold bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        Add Skills Now <ArrowRight size={12} />
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-400">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Inbox className="text-slate-300" size={28} />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">
                        No matches available right now
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Check back later for new AI-matched gigs.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* My gigs / jobs */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-transparent">
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl text-white shadow-lg shadow-slate-500/30 shrink-0">
                    <Briefcase size={18} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base">
                      {user?.role === "client" ? "My Posted Gigs" : "My Active Jobs"}
                    </h2>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">
                      Track milestones and current task progress
                    </p>
                  </div>
                </div>

                {myGigs?.length > 0 && (
                  <Link
                    to="/my-gigs"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 shrink-0"
                  >
                    View all <ArrowRight size={14} />
                  </Link>
                )}
              </div>

              <div className="p-4 sm:p-6">
                {gigsLoading ? (
                  <div className="text-center py-10 text-slate-400">
                    <Clock className="mx-auto mb-2 text-slate-300 animate-pulse" size={26} />
                    <p className="text-sm font-medium">Loading...</p>
                  </div>
                ) : myGigs?.length ? (
                  <div className="divide-y divide-slate-100">
                    {myGigs.slice(0, 8).map((g) => (
                      <Link
                        key={g._id}
                        to={`/gigs/${g._id}`}
                        className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 sm:gap-3 py-4 first:pt-0 last:pb-0 group"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm sm:text-base line-clamp-2 block">
                            {g.title}
                          </span>
                          {g.skillsRequired?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {g.skillsRequired.slice(0, 3).map((skill) => (
                                <span
                                  key={skill}
                                  className="text-[10px] text-slate-400 font-medium capitalize bg-slate-50 border border-slate-200/50 px-1.5 py-0.5 rounded"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <span
                          className={`self-start xs:self-center text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm border shrink-0 ${
                            g.status === "open"
                              ? "bg-blue-50 text-blue-700 border-blue-100"
                              : g.status === "in-progress"
                              ? "bg-amber-50 text-amber-700 border-amber-100"
                              : g.status === "completed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-slate-50 text-slate-500 border-slate-200"
                          }`}
                        >
                          {g.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Inbox className="text-slate-300" size={28} />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">
                      {user?.role === "client"
                        ? "No gigs posted yet"
                        : "No active jobs yet"}
                    </p>
                    <p className="text-xs text-slate-500 mb-4">
                      {user?.role === "client"
                        ? "Post your first gig to start hiring talented freelancers."
                        : "Browse the marketplace to find your first project."}
                    </p>
                    <Link
                      to={user?.role === "client" ? "/create-gig" : "/gigs"}
                      className="inline-flex items-center gap-1.5 text-indigo-600 text-xs font-bold bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      {user?.role === "client" ? (
                        <>
                          <PlusCircle size={14} /> Post Your First Gig
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={14} /> Browse Marketplace
                        </>
                      )}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5 sm:space-y-6 lg:sticky lg:top-24">
            {/* Trending */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl text-white shadow-lg shadow-amber-500/30 shrink-0">
                  <TrendingUp size={18} />
                </div>
                <div className="min-w-0">
                  <h2 className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base">
                    Trending Skills
                  </h2>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">
                    Top demanded tech stacks
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {trending?.length ? (
                  trending.slice(0, 8).map((t, idx) => (
                    <div
                      key={t.skill}
                      className="flex justify-between items-center gap-3 bg-slate-50/50 px-3 sm:px-4 py-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`text-xs font-black w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            idx === 0
                              ? "bg-amber-100 text-amber-700"
                              : idx === 1
                              ? "bg-slate-200 text-slate-700"
                              : idx === 2
                              ? "bg-orange-100 text-orange-700"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-700 text-sm capitalize truncate">
                          {t.skill}
                        </span>
                      </div>
                      <span className="text-xs font-bold bg-white px-2.5 py-1 rounded-lg text-slate-500 border border-slate-200/60 shadow-sm shrink-0">
                        {t.count} {t.count === 1 ? "gig" : "gigs"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <TrendingUp className="mx-auto text-slate-300 mb-2" size={24} />
                    <p className="text-xs text-slate-400 font-medium">
                      No trending skills yet
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 sm:p-5">
              <h3 className="font-extrabold tracking-tight text-xs uppercase text-slate-400 mb-4 flex items-center gap-1.5">
                <span className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full" />
                Quick Actions
              </h3>

              <div className="space-y-2.5">
                {user?.role === "freelancer" && (
                  <>
                    <Link
                      to="/analytics"
                      className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-indigo-700 font-semibold text-sm hover:bg-indigo-50 hover:border-indigo-200 transition-all"
                    >
                      <span className="inline-flex items-center gap-2">
                        <TrendingUp size={16} className="text-indigo-500" /> Analytics
                      </span>
                      <ArrowRight size={14} className="opacity-60" />
                    </Link>

                    <Link
                      to="/my-proposals"
                      className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-emerald-700 font-semibold text-sm hover:bg-emerald-50 hover:border-emerald-200 transition-all"
                    >
                      <span className="inline-flex items-center gap-2">
                        <FileText size={16} className="text-emerald-500" /> My Proposals
                      </span>
                      <ArrowRight size={14} className="opacity-60" />
                    </Link>

                    <Link
                      to="/edit-profile"
                      className="flex items-center justify-between p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-purple-700 font-semibold text-sm hover:bg-purple-50 hover:border-purple-200 transition-all"
                    >
                      <span className="inline-flex items-center gap-2">
                        <User size={16} className="text-purple-500" /> Edit Profile
                      </span>
                      <ArrowRight size={14} className="opacity-60" />
                    </Link>
                  </>
                )}

                {user?.role === "client" && (
                  <>
                    <Link
                      to="/create-gig"
                      className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-indigo-700 font-semibold text-sm hover:bg-indigo-50 hover:border-indigo-200 transition-all"
                    >
                      <span className="inline-flex items-center gap-2">
                        <PlusCircle size={16} className="text-indigo-500" /> Post a Gig
                      </span>
                      <ArrowRight size={14} className="opacity-60" />
                    </Link>

                    <Link
                      to="/edit-profile"
                      className="flex items-center justify-between p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-purple-700 font-semibold text-sm hover:bg-purple-50 hover:border-purple-200 transition-all"
                    >
                      <span className="inline-flex items-center gap-2">
                        <User size={16} className="text-purple-500" /> Edit Profile
                      </span>
                      <ArrowRight size={14} className="opacity-60" />
                    </Link>

                    <Link
                      to="/gigs"
                      className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-amber-700 font-semibold text-sm hover:bg-amber-50 hover:border-amber-200 transition-all"
                    >
                      <span className="inline-flex items-center gap-2">
                        <ShoppingBag size={16} className="text-amber-500" /> Marketplace
                      </span>
                      <ArrowRight size={14} className="opacity-60" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}