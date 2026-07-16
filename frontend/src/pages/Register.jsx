import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../features/authSlice";
import toast from "react-hot-toast";
import { User, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "client",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { loading: reduxLoading, error, user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const nav = useNavigate();

  useEffect(() => {
    if (user) nav("/dashboard");
  }, [user, nav]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    // ✅ Important: confirmPassword ko backend mein nahi bhej rahe
    const { confirmPassword, ...registerData } = form;

    setLoading(true);
    try {
      await dispatch(register(registerData)).unwrap();
      toast.success("Account created successfully! Welcome aboard 🎉");
    } catch (err) {
      toast.error(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || reduxLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-10 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 backdrop-blur-md rounded-2xl">
                <Sparkles className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter">SkillSphere</h1>
            </div>
            <p className="text-2xl font-bold mt-6">Create Account</p>
            <p className="text-indigo-100 mt-2">Join thousands of clients and freelancers</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-2xl mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name, Email, Password, Confirm Password fields same as before */}
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">FULL NAME</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input type="text" placeholder="John Doe" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">EMAIL ADDRESS</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input type="email" placeholder="you@example.com" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">PASSWORD</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input type={showPassword ? "text" : "password"} placeholder="Create a strong password" 
                    required minLength={6} value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">CONFIRM PASSWORD</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" 
                    required value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600">
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-2 block">I WANT TO</label>
                <div className="grid grid-cols-2 gap-3">
                  {["client", "freelancer"].map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setForm({ ...form, role: r })}
                      className={`p-4 rounded-2xl border text-sm font-semibold transition-all ${
                        form.role === r
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      {r === "client" ? "🧑‍💼 I'm a Client" : "👨‍💻 I'm a Freelancer"}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 active:scale-[0.985]"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-400 text-xs mt-8">
          © 2026 GigFlow • Secure Registration
        </p>
      </div>
    </div>
  );
}