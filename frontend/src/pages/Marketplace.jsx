import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import api from "../api/axios";
import {
  Search,
  MapPin,
  IndianRupee,
  Briefcase,
  Filter,
  Loader2,
  PackageOpen,
  ArrowRight,
  Layers,
} from "lucide-react";

const CATEGORIES = [
  "Web Development",
  "Mobile Apps",
  "Design",
  "Writing",
  "Marketing",
  "Video",
  "AI & Data Science",
  "Other",
];

export default function Marketplace() {
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["gigs", category],
    queryFn: () =>
      api
        .get("/gigs", { params: { category: category || undefined } })
        .then((r) => r.data),
  });

  const gigs = useMemo(() => {
    const list = data?.gigs || [];
    const q = search.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (g) =>
        g.title?.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q) ||
        g.skillsRequired?.some((s) => s.toLowerCase().includes(q))
    );
  }, [data?.gigs, search]);

  return (
    <div className="page">
      <div className="container-app space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="p-5 sm:p-6 md:p-8 bg-gradient-to-tr from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl sm:rounded-3xl text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-400/20 via-transparent to-transparent" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 bg-indigo-500/30 text-indigo-200 border border-indigo-500/20 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-wide">
              <Layers className="w-3 h-3" /> Marketplace
            </span>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mt-2 tracking-tight">
              Find Your Next Gig
            </h1>
            <p className="text-indigo-200/80 text-sm mt-1">
              Browse open opportunities and start earning.
            </p>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mt-5 sm:mt-6">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search gigs by title, skill or keyword..."
                  className="w-full pl-12 pr-4 py-3.5 min-h-12 rounded-2xl bg-white text-slate-800 text-sm outline-none focus:ring-4 focus:ring-white/20 placeholder:text-slate-400"
                />
              </div>

              <div className="relative w-full sm:w-64">
                <Filter className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  className="w-full pl-12 pr-10 py-3.5 min-h-12 rounded-2xl bg-white text-slate-800 text-sm font-semibold outline-none focus:ring-4 focus:ring-white/20 cursor-pointer appearance-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
          <button
            onClick={() => setCategory("")}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition min-h-9 ${
              category === ""
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
            }`}
          >
            All
          </button>

          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition min-h-9 ${
                category === c
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-sm text-slate-500 font-medium">
            {gigs.length} {gigs.length === 1 ? "gig" : "gigs"} found
            {category ? ` in ${category}` : ""}
            {search.trim() ? ` for “${search.trim()}”` : ""}
          </p>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 sm:py-24 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-sm">Loading gigs...</p>
          </div>
        ) : gigs.length === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-200 text-center py-16 sm:py-20 px-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <PackageOpen className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-400" />
            </div>
            <p className="text-slate-700 font-semibold">No gigs found</p>
            <p className="text-slate-400 text-sm mt-1">
              Try a different category or search term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {gigs.map((g) => (
              <Link
                key={g._id}
                to={`/gigs/${g._id}`}
                className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm p-4 sm:p-5 hover:border-indigo-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {g.category && (
                  <span className="inline-flex items-center gap-1 self-start text-[10px] font-bold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg mb-3">
                    <Briefcase className="w-3 h-3" /> {g.category}
                  </span>
                )}

                <h3 className="font-bold text-slate-800 text-base sm:text-lg leading-snug line-clamp-2 group-hover:text-indigo-600 transition">
                  {g.title}
                </h3>

                <p className="text-sm text-slate-500 line-clamp-2 mt-2 flex-1">
                  {g.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {g.skillsRequired?.slice(0, 4).map((s) => (
                    <span
                      key={s}
                      className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg"
                    >
                      {s}
                    </span>
                  ))}
                  {g.skillsRequired?.length > 4 && (
                    <span className="text-[11px] font-semibold text-slate-400 px-1 py-1">
                      +{g.skillsRequired.length - 4}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100">
                  <span className="inline-flex items-center gap-0.5 font-black text-emerald-600 text-sm sm:text-base min-w-0 truncate">
                    <IndianRupee className="w-4 h-4 shrink-0" />
                    {g.budgetMin?.toLocaleString() || 0}–{g.budgetMax?.toLocaleString() || 0}
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="max-w-[90px] truncate">
                      {g.location?.city || "Remote"}
                    </span>
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  View Details{" "}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}