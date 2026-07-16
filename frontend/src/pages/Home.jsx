import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  TrendingUp,
  CheckCircle2,
  Code,
  Palette,
  PenTool,
  Video,
  LineChart,
  Megaphone,
  MessageSquare,
} from "lucide-react";

export default function Home() {
  const { user } = useSelector((s) => s.auth);

  const categories = [
    {
      icon: Code,
      name: "Web Development",
      box: "bg-indigo-50 text-indigo-600",
    },
    {
      icon: Palette,
      name: "Design",
      box: "bg-purple-50 text-purple-600",
    },
    {
      icon: PenTool,
      name: "Writing",
      box: "bg-pink-50 text-pink-600",
    },
    {
      icon: Video,
      name: "Video Editing",
      box: "bg-amber-50 text-amber-600",
    },
    {
      icon: LineChart,
      name: "AI & Data Science",
      box: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: Megaphone,
      name: "Marketing",
      box: "bg-rose-50 text-rose-600",
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "AI-Powered Matching",
      desc: "Our smart algorithm connects you with the most relevant gigs or freelancers based on skills and history.",
    },
    {
      icon: Shield,
      title: "Secure Escrow Payments",
      desc: "Funds are held safely until milestones are completed — full protection for both clients and freelancers.",
    },
    {
      icon: MessageSquare,
      title: "Real-Time Chat",
      desc: "Communicate instantly with clients or freelancers without leaving the platform.",
    },
    {
      icon: TrendingUp,
      title: "Growth Analytics",
      desc: "Track your earnings, job success rate, and performance with detailed dashboards.",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Create Your Profile",
      desc: "Sign up and showcase your skills or post your project needs.",
    },
    {
      num: "02",
      title: "Get Matched",
      desc: "Our AI finds the best gigs or freelancers tailored to you.",
    },
    {
      num: "03",
      title: "Collaborate & Deliver",
      desc: "Chat, share files, and track progress in one place.",
    },
    {
      num: "04",
      title: "Get Paid Securely",
      desc: "Milestone-based payments released safely via escrow.",
    },
  ];

  const stats = [
    { label: "Active Freelancers", value: "10,000+" },
    { label: "Gigs Completed", value: "25,000+" },
    { label: "Client Satisfaction", value: "98%" },
    { label: "Categories", value: "50+" },
  ];

  return (
    <div className="bg-white no-x-scroll">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
        <div className="absolute -top-24 -left-24 w-72 sm:w-96 h-72 sm:h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="relative container-app pt-14 sm:pt-20 pb-20 sm:pb-28">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur border border-white/20 text-indigo-200 text-xs font-semibold px-3 sm:px-4 py-1.5 rounded-full mb-5 sm:mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Freelance Marketplace
            </span>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              Where Talent Meets{" "}
              <span className="block sm:inline bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Opportunity
              </span>
            </h1>

            <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-indigo-100/80 max-w-xl mx-auto px-1">
              SkillSphere connects skilled freelancers with clients through
              AI-driven matching, secure payments, and seamless collaboration —
              all in one platform.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-white text-indigo-900 font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl shadow-2xl shadow-indigo-900/50 hover:scale-[1.02] transition-transform min-h-12"
                >
                  Go to Dashboard <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 bg-white text-indigo-900 font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl shadow-2xl shadow-indigo-900/50 hover:scale-[1.02] transition-transform min-h-12"
                  >
                    Get Started Free <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/gigs"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-white font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl hover:bg-white/20 transition-colors min-h-12"
                  >
                    Browse Gigs
                  </Link>
                </>
              )}
            </div>

            <div className="mt-10 sm:mt-14 flex flex-col xs:flex-row flex-wrap items-center justify-center gap-3 sm:gap-8 text-indigo-200/70 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Verified Freelancers
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Secure Escrow
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                24/7 Support
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-slate-50 py-10 sm:py-14 border-b border-slate-100">
        <div className="container-app">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label} className="min-w-0">
                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-indigo-600">
                  {s.value}
                </p>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div className="container-app">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <span className="text-indigo-600 font-bold text-xs sm:text-sm uppercase tracking-wider">
              Explore
            </span>
            <h2 className="section-title text-slate-900 mt-2">
              Popular Categories
            </h2>
            <p className="section-subtitle mx-auto">
              From web development to AI — find the right talent for every kind
              of project.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to="/gigs"
                className="group bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 flex flex-col items-center text-center gap-3 hover:border-indigo-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${cat.box}`}
                >
                  <cat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 leading-snug">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-gradient-to-b from-slate-50 to-white section">
        <div className="container-app">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <span className="text-indigo-600 font-bold text-xs sm:text-sm uppercase tracking-wider">
              Why SkillSphere
            </span>
            <h2 className="section-title text-slate-900 mt-2">
              Built for Modern Freelancing
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="container-app">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <span className="text-indigo-600 font-bold text-xs sm:text-sm uppercase tracking-wider">
              Process
            </span>
            <h2 className="section-title text-slate-900 mt-2">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className="relative">
                <div className="text-5xl sm:text-6xl font-black text-indigo-100 mb-2">
                  {s.num}
                </div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  {s.title}
                </h3>
                <p className="text-sm text-slate-500 mt-2">{s.desc}</p>

                {i < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-6 -right-5 w-5 h-5 text-indigo-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="bg-gradient-to-br from-indigo-600 to-purple-700 py-14 sm:py-20">
          <div className="container-app text-center text-white max-w-4xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              Ready to Get Started?
            </h2>
            <p className="mt-3 sm:mt-4 text-indigo-100 text-sm sm:text-lg max-w-2xl mx-auto">
              Join thousands of clients and freelancers building the future of
              work.
            </p>

            <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-white text-indigo-700 font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl shadow-xl hover:scale-[1.02] transition-transform min-h-12"
              >
                Create Free Account <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur border border-white/30 text-white font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl hover:bg-white/20 transition-colors min-h-12"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}