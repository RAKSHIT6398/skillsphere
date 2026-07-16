import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import GigDetails from "./pages/GigDetails";
import CreateGig from "./pages/CreateGig";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Chat from "./pages/Chat";
import Payments from "./pages/Payments";
import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/AdminDashboard";
import FreelancerAnalytics from "./pages/FreelancerAnalytics";
import Disputes from "./pages/Disputes";
import Availability from "./pages/Availability";
import MyProposals from "./pages/MyProposals";
import Search from "./pages/Search";
import TwoFactorSetup from "./pages/TwoFactorSetup";
import MyGigs from "./pages/MyGigs";

import { connectSocket } from "./api/socket";
import { addNotification } from "./features/notificationSlice";

const Protected = ({ children, roles }) => {
  const { user } = useSelector((s) => s.auth);

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user?._id) return;

    // always string id (critical for call routing too)
    const socket = connectSocket(String(user._id));
    if (!socket) return;

    const handleNotification = (n) => {
      dispatch(addNotification(n));
      toast(`🔔 ${n?.title || "New notification"}`);
    };

    socket.on("notification", handleNotification);

    // if already connected, fine; if not, socket.io queues events
    if (!socket.connected) {
      socket.once("connect", () => {
        console.log("✅ App socket ready:", socket.id);
      });
    }

    return () => {
      // only remove listener, do NOT disconnect global socket
      socket.off("notification", handleNotification);
    };
  }, [user?._id, dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-gray-800 overflow-x-hidden">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          className: "text-sm",
          style: {
            zIndex: 99999,
            maxWidth: "92vw",
          },
        }}
        containerStyle={{
          zIndex: 99999,
          top: 12,
        }}
      />

      <Navbar />

      {/* main grows, footer stays bottom */}
      <main className="flex-1 w-full no-x-scroll">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route
            path="/dashboard"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />

          <Route path="/gigs" element={<Marketplace />} />

          <Route
            path="/gigs/:id"
            element={
              <Protected>
                <GigDetails />
              </Protected>
            }
          />

          <Route
            path="/create-gig"
            element={
              <Protected roles={["client"]}>
                <CreateGig />
              </Protected>
            }
          />

          <Route path="/profile/:id" element={<Profile />} />

          <Route
            path="/edit-profile"
            element={
              <Protected>
                <EditProfile />
              </Protected>
            }
          />

          <Route
            path="/chat"
            element={
              <Protected>
                <Chat />
              </Protected>
            }
          />

          <Route
            path="/payments"
            element={
              <Protected>
                <Payments />
              </Protected>
            }
          />

          <Route
            path="/notifications"
            element={
              <Protected>
                <Notifications />
              </Protected>
            }
          />

          <Route
            path="/admin"
            element={
              <Protected roles={["admin"]}>
                <AdminDashboard />
              </Protected>
            }
          />

          <Route
            path="/analytics"
            element={
              <Protected roles={["freelancer"]}>
                <FreelancerAnalytics />
              </Protected>
            }
          />

          <Route
            path="/disputes"
            element={
              <Protected>
                <Disputes />
              </Protected>
            }
          />

          <Route
            path="/availability"
            element={
              <Protected roles={["freelancer"]}>
                <Availability />
              </Protected>
            }
          />

          <Route
            path="/my-proposals"
            element={
              <Protected roles={["freelancer"]}>
                <MyProposals />
              </Protected>
            }
          />

          <Route path="/search" element={<Search />} />

          <Route
            path="/2fa"
            element={
              <Protected>
                <TwoFactorSetup />
              </Protected>
            }
          />

          <Route
            path="/my-gigs"
            element={
              <Protected>
                <MyGigs />
              </Protected>
            }
          />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}