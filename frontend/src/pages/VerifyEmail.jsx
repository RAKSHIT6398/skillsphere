import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

export default function VerifyEmail() {
  const { token } = useParams();
  const [msg, setMsg] = useState("Verifying your email...");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api
      .get(`/auth/verify-email/${token}`)
      .then((r) => {
        setMsg("✅ " + r.data.message);
        setSuccess(true);
      })
      .catch((e) => {
        setMsg("❌ " + (e.response?.data?.message || "Verification failed"));
        setSuccess(false);
      });
  }, [token]);

  return (
    <div className="max-w-md mx-auto mt-20 card text-center">
      <h2 className="text-xl font-bold">{msg}</h2>
      {success && (
        <p className="text-sm text-gray-500 mt-2">
          Your email has been verified. You can now login.
        </p>
      )}
      <Link to="/login" className="btn-primary inline-block mt-4">
        Go to Login
      </Link>
    </div>
  );
}