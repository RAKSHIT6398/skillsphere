import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useState } from "react";
import {
  ShieldCheck, MapPin, Star, IndianRupee, BadgeCheck, FileText,
  Calendar, Clock, Edit3, GraduationCap, Briefcase, Sparkles,
  Award, MessageSquare, ChevronRight, Lock, CheckCircle2, XCircle,
} from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import Disable2FAModal from "../components/Disable2FAModal";

// ============ 🌟 Interactive Star Picker ============
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-125 active:scale-95"
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              n <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300"
            }`}
          />
        </button>
      ))}
      <span className="ml-1 text-xs font-bold text-slate-500">{hovered || value}/5</span>
    </div>
  );
}

// ============ 💀 Skeleton Loader ============
function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-pulse">
      <div className="h-32 bg-slate-200 rounded-[2rem]" />
      <div className="flex gap-5 -mt-14 px-8">
        <div className="w-28 h-28 bg-slate-300 rounded-3xl ring-4 ring-white" />
        <div className="flex-1 space-y-3 pt-14">
          <div className="h-6 bg-slate-200 rounded-lg w-48" />
          <div className="h-4 bg-slate-100 rounded-lg w-64" />
        </div>
      </div>
      <div className="h-40 bg-slate-100 rounded-3xl" />
      <div className="h-40 bg-slate-100 rounded-3xl" />
    </div>
  );
}

export default function Profile() {
  const { id } = useParams();
  const { user: me } = useSelector((s) => s.auth);
  const [review, setReview] = useState({ rating: 5, comment: "", gigId: "" });
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [bookingSlot, setBookingSlot] = useState(null); // loading state per slot

  // 🔥 FIX: enabled guard — undefined ID wali request backend tak jayegi hi nahi
  const { data: user, refetch } = useQuery({
    queryKey: ["profile", id],
    enabled: !!id,
    queryFn: () => api.get(`/users/${id}`).then((r) => r.data),
  });
  const { data: reviews, refetch: refetchReviews } = useQuery({
    queryKey: ["reviews", id],
    enabled: !!id,
    queryFn: () => api.get(`/reviews/user/${id}`).then((r) => r.data),
  });
  const { data: myGigs } = useQuery({
    queryKey: ["myGigsForReview"],
    enabled: !!me,
    queryFn: () => api.get("/gigs/mine").then((r) => r.data),
  });

  if (!user) return <ProfileSkeleton />;

  // 🔥 FIX: string-safe comparison — ObjectId vs URL param mismatch ke against safety
  const isMe = String(me?._id) === String(id);

  const submitReview = async (e) => {
    e.preventDefault();
    const t = toast.loading("Posting review...");
    try {
      await api.post("/reviews", {
        ...review,
        revieweeId: id,
        rating: +review.rating,
      });
      toast.success("Review submitted! 🎉", { id: t });
      setReview({ rating: 5, comment: "", gigId: "" }); // form reset
      refetch();
      refetchReviews(); // 🔥 FIX: tumhare code mein sirf profile refetch hota tha, reviews nahi!
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed", { id: t });
    }
  };

  const bookSlot = async (di, si) => {
    const key = `${di}-${si}`;
    setBookingSlot(key);
    const t = toast.loading("Booking slot...");
    try {
      await api.post(`/users/${id}/book-slot`, { dateIndex: di, slotIndex: si });
      toast.success("Slot booked! 🎉", { id: t });
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed", { id: t });
    } finally {
      setBookingSlot(null);
    }
  };

  const avgRating = reviews?.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 pb-12">

      {/* ============ 🎨 HERO CARD ============ */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/60 overflow-hidden">
        {/* Gradient Banner */}
        <div className="h-32 bg-gradient-to-tr from-indigo-900 via-indigo-700 to-violet-600 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        </div>

        <div className="px-6 md:px-8 pb-6">
          <div className="flex flex-col sm:flex-row gap-5 -mt-14 relative z-10">
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                className="w-28 h-28 rounded-3xl object-cover ring-4 ring-white shadow-lg"
                alt={user.name}
              />
              {user.isVerifiedBadge && (
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md" title="Verified">
                  <BadgeCheck className="w-6 h-6 text-blue-500" />
                </div>
              )}
            </div>

            <div className="flex-1 sm:pt-14">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">{user.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold capitalize">
                      <Briefcase className="w-3 h-3" /> {user.role}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                      <MapPin className="w-3 h-3" /> {user.location?.city || "Remote"}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {user.reputationScore}/5
                    </span>
                    {user.role === "freelancer" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">
                        <IndianRupee className="w-3 h-3" /> {user.hourlyRate}/hr
                      </span>
                    )}
                  </div>
                </div>

                {isMe && (
                  <Link
                    to="/edit-profile"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                  </Link>
                )}
              </div>

              {user.bio && (
                <p className="mt-3 text-sm text-slate-600 leading-relaxed italic border-l-2 border-indigo-400 pl-3">
                  "{user.bio}"
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============ 🔐 SECURITY (isMe only) ============ */}
      {isMe && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                user.twoFactorEnabled ? "bg-emerald-50" : "bg-slate-100"
              }`}>
                <ShieldCheck className={`w-5 h-5 ${user.twoFactorEnabled ? "text-emerald-600" : "text-slate-400"}`} />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">Two-Factor Authentication</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {user.twoFactorEnabled
                    ? "Your account is protected with Google Authenticator."
                    : "Add an extra security layer to your account."}
                </p>
              </div>
            </div>

            {user.twoFactorEnabled ? (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
                <button
                  onClick={() => setShowDisableModal(true)}
                  className="px-4 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition border border-red-100"
                >
                  Disable
                </button>
              </div>
            ) : (
              <Link
                to="/2fa"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" /> Enable 2FA
              </Link>
            )}
          </div>
        </div>
      )}

      {showDisableModal && (
        <Disable2FAModal
          onClose={() => setShowDisableModal(false)}
          onConfirm={() => {
            refetch();
            setShowDisableModal(false);
          }}
        />
      )}

      {/* ============ FREELANCER SECTIONS ============ */}
      {user.role === "freelancer" && (
        <>
          {/* ⚡ Skills */}
          {user.skills?.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-indigo-500" /> Skills & Expertise
              </h2>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 transition"
                  >
                    {s.name}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                      s.proficiency === "expert" ? "bg-rose-50 text-rose-600"
                      : s.proficiency === "intermediate" ? "bg-amber-50 text-amber-600"
                      : "bg-emerald-50 text-emerald-600"
                    }`}>
                      {s.proficiency}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 🎨 Portfolio */}
          {user.portfolio?.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Briefcase className="w-4 h-4 text-indigo-500" /> Portfolio
              </h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {user.portfolio.map((p, i) => (
                  <a
                    key={i}
                    href={p.link}
                    target="_blank"
                    rel="noreferrer"
                    className="group rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="h-32 bg-gradient-to-br from-indigo-50 to-violet-50 relative overflow-hidden">
                      {p.image ? (
                        <img
                          src={p.image}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt={p.title}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <Briefcase className="w-8 h-8 text-indigo-200" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <p className="font-semibold text-sm text-slate-800 truncate">{p.title}</p>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 🎓 Experience & Certifications */}
          {(user.experience?.length > 0 || user.certifications?.length > 0 || user.resume) && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-500" /> Experience & Certifications
              </h2>

              {/* Timeline */}
              <div className="space-y-0">
                {user.experience?.map((e, i) => (
                  <div key={i} className="relative pl-6 pb-4 border-l-2 border-indigo-100 last:pb-0">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-indigo-500" />
                    <p className="font-semibold text-sm text-slate-800">{e.role} @ {e.company}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {e.from?.slice(0, 10)} → {e.to?.slice(0, 10) || "Present"}
                    </p>
                  </div>
                ))}
              </div>

              {user.certifications?.map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                  <GraduationCap className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">{c.title}</span> — {c.issuer} <span className="text-slate-400">({c.year})</span>
                  </p>
                </div>
              ))}

              {user.resume && (
                <a
                  href={user.resume}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition"
                >
                  <FileText className="w-4 h-4" /> View Resume / CV
                </a>
              )}
            </div>
          )}
        </>
      )}

      {/* ============ 📅 AVAILABILITY & BOOKING ============ */}
      {user.role === "freelancer" && user.availability?.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-5">
            <Calendar className="w-4 h-4 text-indigo-500" /> Availability — Book a Slot
          </h2>

          <div className="space-y-5">
            {user.availability.map((day, di) => (
              <div key={di}>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(day.date).toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                <div className="flex flex-wrap gap-2">
                  {day.slots.map((slot, si) => {
                    const key = `${di}-${si}`;
                    const isLoading = bookingSlot === key;
                    return (
                      <button
                        key={si}
                        disabled={slot.booked || isMe || !me || isLoading}
                        onClick={() => bookSlot(di, si)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          slot.booked
                            ? "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed line-through"
                            : isLoading
                            ? "bg-indigo-100 text-indigo-400 border-indigo-200 cursor-wait"
                            : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-100 active:scale-95 cursor-pointer"
                        }`}
                      >
                        {isLoading ? "Booking..." : `${slot.start} – ${slot.end}`}
                        {slot.booked && <XCircle className="w-3 h-3 inline ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {!me && (
            <p className="text-xs text-slate-400 mt-4 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Login to book a slot
            </p>
          )}
          {isMe && (
            <p className="text-xs text-slate-400 mt-4 italic"></p>
          )}
        </div>
      )}

      {/* ============ 💬 REVIEWS ============ */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-500" /> Reviews ({reviews?.length || 0})
          </h2>
          {avgRating && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-xl">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-black text-amber-600">{avgRating}</span>
              <span className="text-xs text-amber-500/70">avg</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {reviews?.length > 0 ? (
            reviews.map((r) => (
              <div key={r._id} className="flex gap-3 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                <img
                  src={r.reviewer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.reviewer?.name || "U")}&background=e2e8f0&color=64748b`}
                  className="w-10 h-10 rounded-xl object-cover shrink-0"
                  alt=""
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-slate-800">{r.reviewer?.name}</p>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                        />
                      ))}
                    </div>
                    {r.isVerified && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold">
                        <BadgeCheck className="w-3 h-3" /> verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{r.comment}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400 italic text-center py-6">No reviews yet 🚀</p>
          )}
        </div>

        {/* Review Form with Star Picker */}
        {me && !isMe && (
          <form onSubmit={submitReview} className="mt-6 pt-6 border-t border-slate-100 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Leave a Review</p>

            <StarPicker
              value={+review.rating}
              onChange={(n) => setReview({ ...review, rating: n })}
            />

            <select
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
              required
              value={review.gigId}
              onChange={(e) => setReview({ ...review, gigId: e.target.value })}
            >
              <option value="">Select gig you worked on together</option>
              {myGigs?.map((g) => (
                <option key={g._id} value={g._id}>{g.title}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="Write your review..."
                value={review.comment}
                onChange={(e) => setReview({ ...review, comment: e.target.value })}
              />
              <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl transition shadow-sm active:scale-95">
                Post
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}