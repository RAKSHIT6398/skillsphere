// ResetPassword.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Key, Loader2 } from "lucide-react";

export default function ResetPassword() {
  const { token } = useParams();
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      toast.success("Password reset! Login now.");
      nav("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-8 pb-6 text-center">
          <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
            <Key className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Set New Password</h1>
          <p className="text-sm text-slate-500 mt-1">Choose a strong password for your account</p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="px-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key className="h-5 w-5 text-slate-400" />
            </div>
            <input
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              type="password"
              minLength={6}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="p-8 pt-4 text-center">
          <button
            onClick={() => nav("/login")}
            className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
          >
            ← Back to Login
          </button>
        </div>

      </div>
    </div>
  );
}