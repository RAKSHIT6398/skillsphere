import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/authSlice";
import { disconnectSocket } from "../api/socket";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { user } = useSelector((s) => s.auth);
  const { unread } = useSelector((s) => s.notifications);
  const dispatch = useDispatch();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (to) => {
    if (to === "/") return pathname === "/";
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  const closeMenu = () => setOpen(false);

  const handleLogout = () => {
    dispatch(logout());
    disconnectSocket();
    closeMenu();
    nav("/login");
  };

  // route change pe menu auto close
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // mobile menu open pe body scroll lock
  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ESC se close
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const desktopLinkClass = (to) =>
    `nav-link px-2 py-1 ${isActive(to) ? "active" : ""}`;

  const mobileLinkClass = (to) =>
    `block px-3 py-3 rounded-xl transition font-medium ${
      isActive(to)
        ? "bg-brand-50 text-brand-700"
        : "text-gray-700 hover:bg-brand-50"
    }`;

  const avatar =
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.name || "User"
    )}&background=2563eb&color=fff`;

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="container-app h-16 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 group shrink-0"
          onClick={closeMenu}
        >
          <span
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 
            flex items-center justify-center text-white font-extrabold text-lg 
            shadow-glow group-hover:rotate-6 transition-transform"
          >
            S
          </span>
          <span className="text-lg sm:text-xl font-extrabold">
            Skill<span className="gradient-text">Sphere</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm min-w-0">
          <Link to="/" className={desktopLinkClass("/")}>
            Home
          </Link>

          {user && (
            <Link to="/dashboard" className={desktopLinkClass("/dashboard")}>
              Dashboard
            </Link>
          )}

          <Link to="/gigs" className={desktopLinkClass("/gigs")}>
            Marketplace
          </Link>

          <Link to="/search" className={desktopLinkClass("/search")}>
            Search
          </Link>

          {user ? (
            <>
              <Link to="/chat" className={desktopLinkClass("/chat")}>
                Chat
              </Link>

              <Link to="/payments" className={desktopLinkClass("/payments")}>
                Payments
              </Link>

              {user.role === "freelancer" && (
                <>
                  <Link
                    to="/my-proposals"
                    className={desktopLinkClass("/my-proposals")}
                  >
                    Proposals
                  </Link>
                  <Link
                    to="/analytics"
                    className={desktopLinkClass("/analytics")}
                  >
                    Analytics
                  </Link>
                  <Link
                    to="/availability"
                    className={desktopLinkClass("/availability")}
                  >
                    Calendar
                  </Link>
                </>
              )}

              {user.role === "client" && (
                <Link to="/create-gig" className="btn-primary btn-sm ml-1">
                  + Post Gig
                </Link>
              )}

              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="badge bg-red-100 text-red-600 border border-red-200 ml-1"
                >
                  🛡️ Admin
                </Link>
              )}

              <Link
                to="/notifications"
                className="relative btn-icon ml-1"
                aria-label="Notifications"
              >
                🔔
                {unread > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-red-500 to-pink-500 
                    text-white text-[10px] rounded-full min-w-5 h-5 px-1 flex items-center justify-center
                    font-bold animate-pop shadow"
                  >
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>

              <Link
                to={`/profile/${user._id}`}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full 
                  hover:bg-brand-50 transition border border-transparent hover:border-brand-100"
              >
                <img
                  src={avatar}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-200"
                  alt={user.name || "User"}
                />
                <span className="font-semibold max-w-[100px] truncate">
                  {user.name?.split(" ")[0] || "User"}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="btn-icon text-gray-400 hover:text-red-500"
                title="Logout"
                aria-label="Logout"
              >
                ⏻
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link to="/login" className="btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn-primary btn-sm">
                Sign Up Free
              </Link>
            </div>
          )}
        </div>

        {/* Mobile right actions */}
        <div className="flex items-center gap-1 sm:gap-2 lg:hidden">
          {user && (
            <Link
              to="/notifications"
              className="relative btn-icon"
              aria-label="Notifications"
            >
              🔔
              {unread > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-red-500 to-pink-500 
                  text-white text-[10px] rounded-full min-w-5 h-5 px-1 flex items-center justify-center
                  font-bold shadow"
                >
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            className="btn-icon"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <>
          {/* backdrop */}
          <div
            className="lg:hidden fixed inset-0 top-16 bg-black/30 backdrop-blur-[1px] z-40"
            onClick={closeMenu}
          />

          <div className="lg:hidden absolute left-0 right-0 top-16 z-50 border-t border-white/20 bg-white/95 backdrop-blur-md shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="container-app py-3 flex flex-col gap-1 text-sm safe-bottom">
              <Link to="/" className={mobileLinkClass("/")} onClick={closeMenu}>
                Home
              </Link>

              {user && (
                <Link
                  to="/dashboard"
                  className={mobileLinkClass("/dashboard")}
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
              )}

              <Link
                to="/gigs"
                className={mobileLinkClass("/gigs")}
                onClick={closeMenu}
              >
                Marketplace
              </Link>

              <Link
                to="/search"
                className={mobileLinkClass("/search")}
                onClick={closeMenu}
              >
                Search
              </Link>

              {user ? (
                <>
                  <Link
                    to="/chat"
                    className={mobileLinkClass("/chat")}
                    onClick={closeMenu}
                  >
                    Chat
                  </Link>

                  <Link
                    to="/payments"
                    className={mobileLinkClass("/payments")}
                    onClick={closeMenu}
                  >
                    Payments
                  </Link>

                  {user.role === "freelancer" && (
                    <>
                      <Link
                        to="/my-proposals"
                        className={mobileLinkClass("/my-proposals")}
                        onClick={closeMenu}
                      >
                        Proposals
                      </Link>
                      <Link
                        to="/analytics"
                        className={mobileLinkClass("/analytics")}
                        onClick={closeMenu}
                      >
                        Analytics
                      </Link>
                      <Link
                        to="/availability"
                        className={mobileLinkClass("/availability")}
                        onClick={closeMenu}
                      >
                        Calendar
                      </Link>
                    </>
                  )}

                  {user.role === "client" && (
                    <Link
                      to="/create-gig"
                      className="btn-primary mt-2"
                      onClick={closeMenu}
                    >
                      + Post Gig
                    </Link>
                  )}

                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      className="badge bg-red-100 text-red-600 border border-red-200 w-fit mt-2"
                      onClick={closeMenu}
                    >
                      🛡️ Admin
                    </Link>
                  )}

                  <div className="my-2 border-t border-gray-100" />

                  <Link
                    to={`/profile/${user._id}`}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-brand-50"
                    onClick={closeMenu}
                  >
                    <img
                      src={avatar}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-200"
                      alt={user.name || "User"}
                    />
                    <div className="min-w-0">
                      <p className="font-semibold truncate">
                        {user.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user.role || "member"}
                      </p>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="text-left px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    to="/login"
                    className="btn-outline text-center"
                    onClick={closeMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-center"
                    onClick={closeMenu}
                  >
                    Sign Up Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}