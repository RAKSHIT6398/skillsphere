import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { login, setCredentials } from "../features/authSlice";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Sparkles, ArrowRight, Loader2 } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", twoFactorCode: "" });
  const [showPassword, setShowPassword] = useState(false);
  
  const { loading, error, user, twoFactorRequired } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const nav = useNavigate();

  useEffect(() => {
    if (user) nav("/dashboard");
  }, [user, nav]);

  // Google Sign-In with retry logic
  useEffect(() => {
    let attempts = 0;

    const initGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: async (res) => {
            try {
              const { data } = await api.post("/auth/google", { credential: res.credential });
              dispatch(setCredentials(data));
              toast.success("Logged in with Google! 🎉");
            } catch {
              toast.error("Google login failed");
            }
          },
        });
        window.google.accounts.id.renderButton(document.getElementById("googleBtn"), {
          theme: "outline",
          size: "large",
          width: 360,
          text: "signin_with",
        });
      } else if (attempts < 20) {
        attempts++;
        setTimeout(initGoogle, 300);
      }
    };

    initGoogle();
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-10 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 backdrop-blur-md rounded-2xl">
                <Sparkles className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter">SkillSphere</h1>
            </div>
            <p className="text-2xl font-bold mt-6">Welcome Back 👋</p>
            <p className="text-indigo-100 mt-2">Sign in to continue to your dashboard</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-2xl mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">EMAIL ADDRESS</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">PASSWORD</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* 2FA Code (Conditional) */}
              {twoFactorRequired && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">TWO FACTOR CODE</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-3.5 w-5 h-5 text-amber-500" />
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={form.twoFactorCode}
                      onChange={(e) => setForm({ ...form, twoFactorCode: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 bg-amber-50/40 border border-amber-200 rounded-2xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-center tracking-widest"
                      maxLength={6}
                    />
                  </div>
                </div>
              )}

              {/* Forgot Password */}
              <div className="flex justify-end -mt-2">
                <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 active:scale-[0.985]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-8">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">or continue with</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Google Button */}
            <div id="googleBtn" className="flex justify-center mb-6" />

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs mt-8">
          © 2026 SkillSphere • Secure Login
        </p>
      </div>
    </div>
  );
}