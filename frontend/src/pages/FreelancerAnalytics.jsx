import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, CartesianGrid, Legend
} from "recharts";
import {
  TrendingUp, Eye, Star, IndianRupee, Briefcase, Award,
  BarChart3, PieChart as PieIcon, Activity, Loader2, AlertCircle,
  ArrowUpRight, Sparkles, Target, Zap, Trophy, Users
} from "lucide-react";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
const STATUS_COLORS = {
  accepted: "#10b981",
  pending: "#f59e0b",
  rejected: "#ef4444",
  withdrawn: "#94a3b8",
};

// ==================== ✅ HELPER FUNCTION (Component ke BAHAR) ====================
function calculateTrend(current, previous) {
  if (!previous && !current) return { change: "No data", trend: "neutral", percent: 0 };
  if (!previous && current > 0) return { change: "New!", trend: "up", percent: 100 };
  if (previous > 0 && !current) return { change: "-100%", trend: "down", percent: -100 };
  
  const percentChange = Math.round(((current - previous) / previous) * 100);
  
  if (percentChange > 0) return { change: `+${percentChange}%`, trend: "up", percent: percentChange };
  if (percentChange < 0) return { change: `${percentChange}%`, trend: "down", percent: percentChange };
  return { change: "0%", trend: "neutral", percent: 0 };
}

// ==================== MAIN COMPONENT ====================
export default function FreelancerAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ["fAnalytics"],
    queryFn: () => api.get("/analytics/freelancer").then((r) => r.data),
  });

  // ==================== LOADING STATE ====================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  // ==================== NO DATA STATE ====================
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-700 font-semibold text-lg">No analytics data available</p>
          <p className="text-slate-500 text-sm mt-1">Start applying to gigs to see your stats!</p>
        </div>
      </div>
    );
  }

  // ==================== ✅ CALCULATIONS (return se PEHLE) ====================
  const totalApplications = data.applications?.reduce((sum, a) => sum + a.count, 0) || 0;
  const acceptedCount = data.applications?.find(a => a._id === "accepted")?.count || 0;
  const acceptanceRate = totalApplications > 0 ? Math.round((acceptedCount / totalApplications) * 100) : 0;
  const totalReviews = data.feedbackDistribution?.reduce((sum, f) => sum + f.count, 0) || 0;
  const avgRating = totalReviews > 0
    ? (data.feedbackDistribution?.reduce((sum, f) => sum + (f._id * f.count), 0) / totalReviews).toFixed(1)
    : 0;

  // ==================== 🎯 REAL TREND CALCULATIONS ====================
  const trends = data.trends || {};

  const earningsTrend = calculateTrend(
    trends.thisMonthEarnings || 0, 
    trends.lastMonthEarnings || 0
  );

  const profileViewsTrend = calculateTrend(
    trends.currentWeekViews || 0, 
    trends.previousWeekViews || 0
  );

  const jobsTrend = calculateTrend(
    trends.thisMonthJobs || 0, 
    trends.lastMonthJobs || 0
  );

  const reputationTrend = avgRating >= 4.5 
    ? { change: "Excellent", trend: "up" }
    : avgRating >= 4 
    ? { change: "Very Good", trend: "up" }
    : avgRating >= 3 
    ? { change: "Good", trend: "neutral" }
    : avgRating > 0 
    ? { change: "Needs Improvement", trend: "down" }
    : { change: "No reviews", trend: "neutral" };

  // ==================== ✅ MAIN RETURN (JSX) ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* ==================== HEADER ==================== */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 shadow-2xl shadow-indigo-500/20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22><path fill=%22%23ffffff%22 fill-opacity=%220.05%22 d=%22M30 30l30-30v60z%22/></svg>')]" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl" />

          <div className="relative p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="text-white">
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 mb-3">
                <BarChart3 size={12} /> Freelancer Analytics
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-3">
                <TrendingUp className="w-8 h-8" />
                My Performance
              </h1>
              <p className="mt-2 text-indigo-100 text-base sm:text-lg">
                Track your growth, earnings, and reputation in real-time.
              </p>
            </div>

            <div className="hidden sm:flex flex-col items-end text-white">
              <p className="text-xs font-semibold text-indigo-200 uppercase tracking-widest">
                Success Rate
              </p>
              <p className="text-5xl font-black mt-1 flex items-center gap-1">
                {acceptanceRate}<span className="text-3xl">%</span>
              </p>
            </div>
          </div>
        </div>

        {/* ==================== TOP STATS GRID ==================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Eye size={22} />}
            label="Profile Views"
            value={data.profileViews || 0}
            color="blue"
            change={profileViewsTrend.change}
            trend={profileViewsTrend.trend}
          />
          <StatCard
            icon={<Star size={22} />}
            label="Reputation Score"
            value={avgRating || 0}
            suffix="/5"
            color="amber"
            change={reputationTrend.change}
            trend={reputationTrend.trend}
          />
          <StatCard
            icon={<IndianRupee size={22} />}
            label="Total Earnings"
            value={`₹${(data.earnings?.total || 0).toLocaleString('en-IN')}`}
            color="emerald"
            change={earningsTrend.change}
            trend={earningsTrend.trend}
          />
          <StatCard
            icon={<Briefcase size={22} />}
            label="Jobs Paid"
            value={data.earnings?.count || 0}
            color="purple"
            change={jobsTrend.change}
            trend={jobsTrend.trend}
          />
        </div>

        {/* ==================== QUICK INSIGHTS ==================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <InsightCard
            icon={<Target size={20} />}
            title="Acceptance Rate"
            value={`${acceptanceRate}%`}
            subtitle={`${acceptedCount} out of ${totalApplications} applications`}
            color="emerald"
          />
          <InsightCard
            icon={<Trophy size={20} />}
            title="Average Rating"
            value={avgRating}
            subtitle={`Based on ${totalReviews} reviews`}
            color="amber"
          />
          <InsightCard
            icon={<Zap size={20} />}
            title="Active Applications"
            value={data.applications?.find(a => a._id === "pending")?.count || 0}
            subtitle="Awaiting client response"
            color="indigo"
          />
        </div>

        {/* ==================== CHARTS GRID ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* MONTHLY REVENUE CHART */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white shadow-lg shadow-emerald-500/30">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">Monthly Revenue</h3>
                  <p className="text-xs text-slate-500 font-medium">Your earnings over time</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                Last 6 months
              </span>
            </div>

            {data.monthlyRevenue?.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.monthlyRevenue}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="_id" 
                    stroke="#94a3b8" 
                    style={{ fontSize: '12px', fontWeight: 600 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    style={{ fontSize: '12px', fontWeight: 600 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${v > 999 ? (v/1000).toFixed(0) + 'k' : v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      padding: '12px',
                    }}
                    labelStyle={{ color: '#0f172a', fontWeight: 700, marginBottom: 4 }}
                    formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="url(#revenueGradient)"
                    dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: 'white' }}
                    activeDot={{ r: 7, strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No revenue data yet" />
            )}
          </div>

          {/* APPLICATIONS STATUS PIE CHART */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl text-white shadow-lg shadow-purple-500/30">
                  <PieIcon size={18} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">Applications Status</h3>
                  <p className="text-xs text-slate-500 font-medium">Distribution of your proposals</p>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full">
                {totalApplications} total
              </span>
            </div>

            {data.applications?.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={data.applications}
                      dataKey="count"
                      nameKey="_id"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={4}
                    >
                      {data.applications.map((entry, i) => (
                        <Cell 
                          key={i} 
                          fill={STATUS_COLORS[entry._id] || COLORS[i % COLORS.length]}
                          stroke="white"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="flex flex-col justify-center gap-3">
                  {data.applications.map((entry) => (
                    <div key={entry._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: STATUS_COLORS[entry._id] || COLORS[0] }}
                        />
                        <span className="text-xs font-bold text-slate-700 capitalize">{entry._id}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">{entry.count}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">
                          {Math.round((entry.count / totalApplications) * 100)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyChart message="No applications yet" />
            )}
          </div>
        </div>

        {/* ==================== FEEDBACK DISTRIBUTION ==================== */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl text-white shadow-lg shadow-amber-500/30">
                <Star size={18} />
              </div>
              <div>
                <h3 className="font-black text-slate-900">Client Feedback Distribution</h3>
                <p className="text-xs text-slate-500 font-medium">How clients rate your work</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-2 rounded-2xl border border-amber-200">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="text-lg font-black text-amber-700">{avgRating}</span>
              <span className="text-xs text-amber-600 font-semibold">avg rating</span>
            </div>
          </div>

          {data.feedbackDistribution?.length > 0 ? (
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((rating) => {
                const feedback = data.feedbackDistribution?.find(f => f._id === rating);
                const count = feedback?.count || 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="group">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 w-20">
                        <span className="font-bold text-slate-700">{rating}</span>
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      </div>
                      
                      <div className="flex-1 relative">
                        <div className="h-8 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 flex items-center justify-end pr-3 ${
                              rating >= 4 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                              rating >= 3 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                              'bg-gradient-to-r from-red-400 to-red-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          >
                            {percentage > 15 && (
                              <span className="text-white font-bold text-xs">
                                {Math.round(percentage)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-24 text-right">
                        <span className="text-lg font-black text-slate-900">{count}</span>
                        <span className="text-xs text-slate-500 font-semibold ml-1">
                          {count === 1 ? 'review' : 'reviews'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyChart message="No reviews yet" />
          )}
        </div>

        {/* ==================== PRO TIPS CARD ==================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                </div>
                <h3 className="font-black text-lg">Boost Your Profile</h3>
              </div>
              <p className="text-sm text-indigo-100 leading-relaxed mb-4">
                Complete profile with skills, portfolio and certifications gets 5× more views and higher acceptance rate.
              </p>
              <a href="/edit-profile" className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 backdrop-blur-md hover:bg-white/30 px-4 py-2 rounded-xl transition-all border border-white/20">
                Update Profile <ArrowUpRight size={12} />
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                  <Award className="w-5 h-5 text-yellow-300" />
                </div>
                <h3 className="font-black text-lg">Earn More</h3>
              </div>
              <p className="text-sm text-emerald-100 leading-relaxed mb-4">
                Apply to at least 5 gigs daily and respond within 1 hour. Fast responders get 3× more hires!
              </p>
              <a href="/gigs" className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 backdrop-blur-md hover:bg-white/30 px-4 py-2 rounded-xl transition-all border border-white/20">
                Browse Gigs <ArrowUpRight size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================

function StatCard({ icon, label, value, suffix, color, change, trend }) {
  const gradients = {
    blue: "from-blue-500 to-cyan-600 shadow-blue-500/30",
    amber: "from-amber-500 to-orange-600 shadow-amber-500/30",
    emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/30",
    purple: "from-purple-500 to-pink-600 shadow-purple-500/30",
  };

  const glowColors = {
    blue: "bg-blue-500/10",
    amber: "bg-amber-500/10",
    emerald: "bg-emerald-500/10",
    purple: "bg-purple-500/10",
  };

  const trendStyles = {
    up: { class: "text-emerald-700 bg-emerald-50 border-emerald-100", icon: "↑" },
    down: { class: "text-red-700 bg-red-50 border-red-100", icon: "↓" },
    neutral: { class: "text-slate-600 bg-slate-50 border-slate-200", icon: "•" },
  };

  const trendStyle = trendStyles[trend] || trendStyles.neutral;

  return (
    <div className="group relative bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <div className={`absolute -top-6 -right-6 w-24 h-24 ${glowColors[color]} rounded-full blur-2xl group-hover:scale-125 transition-transform`} />
      
      <div className="relative">
        <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${gradients[color]} text-white shadow-lg`}>
          {icon}
        </div>
        
        <p className="text-3xl font-black text-slate-900 mt-4 leading-none">
          {value}{suffix && <span className="text-lg text-slate-500">{suffix}</span>}
        </p>
        
        <div className="flex items-center justify-between mt-2 gap-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
          {change && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${trendStyle.class}`}>
              <span className="mr-0.5">{trendStyle.icon}</span> {change}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function InsightCard({ icon, title, value, subtitle, color }) {
  const styles = {
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
    amber: "bg-amber-50 border-amber-100 text-amber-700",
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-700",
  };

  const iconStyles = {
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    indigo: "bg-indigo-100 text-indigo-600",
  };

  return (
    <div className={`p-5 rounded-2xl border-2 ${styles[color]}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-xl ${iconStyles[color]}`}>{icon}</div>
        <h3 className="font-bold text-sm">{title}</h3>
      </div>
      <p className="text-3xl font-black text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 font-medium mt-1">{subtitle}</p>
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <BarChart3 className="w-12 h-12 mb-3 text-slate-300" />
      <p className="text-sm font-semibold">{message}</p>
      <p className="text-xs mt-1">Data will appear as you engage with the platform</p>
    </div>
  );
}