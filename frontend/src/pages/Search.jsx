import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import {
  Search as SearchIcon,
  Briefcase,
  Users,
  MapPin,
  IndianRupee,
  Star,
  BadgeCheck,
  SlidersHorizontal,
  Target,
  Sparkles,
  Loader2,
  PackageOpen,
  RotateCcw,
  ArrowRight,
  Zap,
} from "lucide-react";

const EMPTY_FILTERS = {
  q: "", skill: "", city: "", minPrice: "", maxPrice: "",
  minRating: "", maxRate: "", experience: "",
};

export default function Search() {
  const [mode, setMode] = useState("gigs");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef(null);

  // ─── Core search function ───
  const runSearch = useCallback(async (currentMode, currentFilters) => {
    setLoading(true);
    setSearched(true);
    try {
      const params = Object.fromEntries(
        Object.entries(currentFilters).filter(([, v]) => v !== "" && v !== null && v !== "0")
      );
      const { data } = await api.get(`/search/${currentMode}`, { params });
      setResults(currentMode === "gigs" ? data.gigs || [] : data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── ✨ AUTO SEARCH with debounce (whenever filters/mode change) ───
  useEffect(() => {
    // clear previous timer
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // debounce: wait 500ms after user stops typing/sliding
    debounceRef.current = setTimeout(() => {
      runSearch(mode, filters);
    }, 500);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, mode]);

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
  };

  const switchMode = (m) => {
    setMode(m);
    setResults([]);
    setFilters(EMPTY_FILTERS);
  };

  // Helper to update a single filter
  const setF = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* ═══════ Header ═══════ */}
      <div className="p-6 md:p-7 bg-gradient-to-tr from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl text-white shadow-2xl relative overflow-hidden mb-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-400/20 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-indigo-500/30 text-indigo-200 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
              <Zap className="w-3 h-3" /> Live Search
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">Advanced Search</h1>
            <p className="text-indigo-200/80 text-sm mt-1">
              Results update instantly 
            </p>
          </div>
          {/* Live indicator */}
          <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-2xl px-4 py-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold text-emerald-300">LIVE</span>
          </div>
        </div>
      </div>

      {/* ═══════ Layout ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

        {/* ─── STICKY SIDEBAR FILTERS ─── */}
        <aside className="lg:sticky lg:top-6 h-fit">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Mode toggle */}
            <div className="p-2 bg-slate-50/60 border-b border-slate-100">
              <div className="flex gap-1.5">
                {[
                  { id: "gigs", label: "Gigs", icon: Briefcase },
                  { id: "freelancers", label: "Talent", icon: Users },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button key={m.id} onClick={() => switchMode(m.id)}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                        mode === m.id
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                          : "text-slate-500 hover:text-slate-800 hover:bg-white"
                      }`}>
                      <Icon className="w-4 h-4" /> {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filters */}
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" /> Filters
                </h3>
                <button onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-rose-500 transition">
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>

              {mode === "gigs" ? (
                <>
                  <div className="relative">
                    <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                      placeholder="Keywords" value={filters.q} onChange={(e) => setF("q", e.target.value)} />
                  </div>
                  <div className="relative">
                    <Sparkles className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                      placeholder="Skill" value={filters.skill} onChange={(e) => setF("skill", e.target.value)} />
                  </div>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                      placeholder="City" value={filters.city} onChange={(e) => setF("city", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1.5">
                      <Target className="w-3.5 h-3.5" /> Experience Level
                    </label>
                    <select className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition capitalize"
                      value={filters.experience} onChange={(e) => setF("experience", e.target.value)}>
                      <option value="">Any experience</option>
                      {["beginner", "intermediate", "expert"].map((l) => <option key={l} className="capitalize">{l}</option>)}
                    </select>
                  </div>

                  {/* Budget Range Slider */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 flex items-center justify-between mb-2">
                      <span className="flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5" /> Budget Range</span>
                      <span className="text-indigo-600 font-bold">₹{filters.minPrice || 0} – ₹{filters.maxPrice || "∞"}</span>
                    </label>
                    <input type="range" min="0" max="100000" step="1000" value={filters.maxPrice || 0}
                      onChange={(e) => setF("maxPrice", e.target.value)}
                      className="w-full h-2 accent-indigo-600 cursor-pointer" />
                    <div className="flex gap-2 mt-2">
                      <input className="w-1/2 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        type="number" placeholder="Min ₹" value={filters.minPrice} onChange={(e) => setF("minPrice", e.target.value)} />
                      <input className="w-1/2 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        type="number" placeholder="Max ₹" value={filters.maxPrice} onChange={(e) => setF("maxPrice", e.target.value)} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative">
                    <Sparkles className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                      placeholder="Skill" value={filters.skill} onChange={(e) => setF("skill", e.target.value)} />
                  </div>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                      placeholder="City" value={filters.city} onChange={(e) => setF("city", e.target.value)} />
                  </div>

                  {/* Rating Slider */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 flex items-center justify-between mb-2">
                      <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> Min Rating</span>
                      <span className="text-amber-500 font-bold flex items-center gap-0.5">
                        {filters.minRating || 0} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      </span>
                    </label>
                    <input type="range" min="0" max="5" step="0.5" value={filters.minRating || 0}
                      onChange={(e) => setF("minRating", e.target.value)}
                      className="w-full h-2 accent-amber-500 cursor-pointer" />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>0</span><span>2.5</span><span>5</span>
                    </div>
                  </div>

                  {/* Max hourly rate slider */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 flex items-center justify-between mb-2">
                      <span className="flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5" /> Max Hourly Rate</span>
                      <span className="text-indigo-600 font-bold">₹{filters.maxRate || "∞"}/hr</span>
                    </label>
                    <input type="range" min="0" max="10000" step="100" value={filters.maxRate || 0}
                      onChange={(e) => setF("maxRate", e.target.value)}
                      className="w-full h-2 accent-indigo-600 cursor-pointer" />
                    <input className="w-full mt-2 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                      type="number" placeholder="Max rate ₹" value={filters.maxRate} onChange={(e) => setF("maxRate", e.target.value)} />
                  </div>
                </>
              )}

              {/* ✨ Auto-search hint (no button) */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                {loading ? (
                  <><Loader2 className="w-3 h-3 animate-spin text-indigo-500" /> Searching...</>
                ) : (
                  <><Zap className="w-3 h-3 text-emerald-500" /> Auto-updating results</>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* ─── RESULTS (auto-updating) ─── */}
        <main>
          {searched && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
                {results.length} {mode === "gigs" ? "gigs" : "freelancers"} found
              </p>
            </div>
          )}

          {loading && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
              <p className="text-sm">Searching...</p>
            </div>
          ) : !searched ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center py-24 px-6">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="w-8 h-8 text-indigo-400" />
              </div>
              <p className="text-slate-700 font-semibold">Start typing to search</p>
              <p className="text-slate-400 text-sm mt-1">Results appear automatically as you set filters.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center py-24 px-6">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PackageOpen className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-700 font-semibold">No results found</p>
              <p className="text-slate-400 text-sm mt-1">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 xl:grid-cols-2 gap-4 transition-opacity ${loading ? "opacity-60" : "opacity-100"}`}>
              {results.map((item) =>
                mode === "gigs" ? (
                  <Link key={item._id} to={`/gigs/${item._id}`}
                    className="group bg-white rounded-3xl border border-slate-100 shadow-sm p-5 hover:border-indigo-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                    {item.category && (
                      <span className="inline-flex items-center gap-1 self-start text-[10px] font-bold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg mb-2">
                        <Briefcase className="w-3 h-3" /> {item.category}
                      </span>
                    )}
                    <h3 className="font-bold text-lg text-slate-800 leading-snug line-clamp-2 group-hover:text-indigo-600 transition">{item.title}</h3>
                    {item.description && <p className="text-sm text-slate-500 line-clamp-2 mt-1.5 flex-1">{item.description}</p>}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {item.skillsRequired?.slice(0, 3).map((s) => (
                        <span key={s} className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">{s}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                      <span className="inline-flex items-center gap-0.5 font-black text-emerald-600">
                        <IndianRupee className="w-4 h-4" />{item.budgetMin?.toLocaleString()}–{item.budgetMax?.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                        <MapPin className="w-3.5 h-3.5" />{item.location?.city || "Remote"}
                      </span>
                    </div>
                  </Link>
                ) : (
                  <Link key={item._id} to={`/profile/${item._id}`}
                    className="group bg-white rounded-3xl border border-slate-100 shadow-sm p-5 hover:border-indigo-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-4">
                    <img src={item.avatar || `https://ui-avatars.com/api/?name=${item.name}&background=6366f1&color=fff`}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0" alt={item.name} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 flex items-center gap-1 truncate group-hover:text-indigo-600 transition">
                        {item.name}{item.isVerifiedBadge && <BadgeCheck className="w-4 h-4 text-indigo-500 shrink-0" />}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{item.reputationScore}
                        </span>
                        <span className="flex items-center gap-0.5 text-emerald-600 font-bold">
                          <IndianRupee className="w-3.5 h-3.5" />{item.hourlyRate}/hr
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5 truncate">{item.skills?.map((s) => s.name).join(" • ") || "No skills listed"}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all shrink-0" />
                  </Link>
                )
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}