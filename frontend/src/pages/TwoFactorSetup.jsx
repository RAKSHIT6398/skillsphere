import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function TwoFactorSetup() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [settingUp, setSettingUp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [success, setSuccess] = useState(false);
  const [qr, setQr] = useState(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setEnabled(data.user.twoFactorEnabled);
      } catch (err) {
        toast.error("Unable to load security settings");
      } finally {
        setLoading(false);
      }
    };
    loadStatus();
  }, []);

  const setup = async () => {
    try {
      setSettingUp(true);
      const { data } = await api.post("/auth/2fa/setup");
      setQr(data.qr);
      toast.success("QR Code generated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to generate QR Code");
    } finally {
      setSettingUp(false);
    }
  };

  const verify = async () => {
    if (code.trim().length !== 6) return toast.error("Please enter a valid 6 digit code");
    try {
      setVerifying(true);
      await api.post("/auth/2fa/verify", { code: code.trim() });
      toast.success("2FA Enabled Successfully 🎉");
      setSuccess(true);
      setTimeout(() => navigate(`/profile/${user._id}`), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid verification code");
    } finally {
      setVerifying(false);
    }
  };

  // --- Rendering Logic ---

  if (loading) return <LoadingScreen />;
  if (success) return <SuccessScreen />;
  if (enabled) return <EnabledScreen navigate={navigate} userId={user?._id} />;

  return (
    <div className="max-w-md mx-auto mt-16 card">
      <h1 className="text-3xl font-bold text-center">Two-Factor Authentication</h1>
      <p className="text-center text-gray-500 mt-3 mb-8">Secure your account with Google Authenticator.</p>

      {!qr ? (
        <button onClick={setup} disabled={settingUp} className="btn-primary w-full">
          {settingUp ? "Generating QR Code..." : "Enable 2FA"}
        </button>
      ) : (
        <>
          <div className="flex justify-center">
            <img src={qr} alt="QR Code" className="rounded-xl border shadow" />
          </div>
          <p className="text-sm text-gray-500 text-center mt-5">
            Open <b>Google Authenticator</b>, scan this QR code, then enter the 6-digit code below.
          </p>
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="input w-full mt-5"
            placeholder="Enter 6-digit code"
          />
          <button onClick={verify} disabled={verifying} className="btn-primary w-full mt-5">
            {verifying ? "Verifying..." : "Verify & Enable"}
          </button>
          <button onClick={() => navigate(`/profile/${user._id}`)} className="btn-outline w-full mt-3">
            Cancel
          </button>
        </>
      )}
    </div>
  );
}

// --- Sub-Components ---

const LoadingScreen = () => (
  <div className="max-w-md mx-auto mt-20 card text-center">
    <div className="text-5xl mb-4">⏳</div>
    <h2 className="text-xl font-semibold">Loading Security Settings...</h2>
  </div>
);

const SuccessScreen = () => (
  <div className="max-w-md mx-auto mt-16 card text-center">
    <div className="text-6xl mb-4">🔐</div>
    <h1 className="text-3xl font-bold text-green-600">2FA Enabled</h1>
    <p className="mt-4 text-gray-600">Your account is now protected.</p>
    <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
      <p className="font-semibold text-green-700">✅ Redirecting to your profile...</p>
    </div>
  </div>
);

const EnabledScreen = ({ navigate, userId }) => (
  <div className="max-w-md mx-auto mt-16 card text-center">
    <div className="text-6xl mb-4">🛡️</div>
    <h1 className="text-3xl font-bold text-green-600">Two-Factor Authentication</h1>
    <p className="text-gray-600 mt-4">Your account is already protected.</p>
    <button onClick={() => navigate(`/profile/${userId}`)} className="btn-primary w-full mt-6">
      Back to Profile
    </button>
  </div>
);