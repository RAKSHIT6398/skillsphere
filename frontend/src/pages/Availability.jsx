import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import api from "../api/axios";
import toast from "react-hot-toast";
import { setUser } from "../features/authSlice";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CalendarPlus,
  Save,
  CircleCheck,
  Loader2,
  CalendarX,
  Lock,
} from "lucide-react";

export default function Availability() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const [availability, setAvailability] = useState(user.availability || []);
  const [saving, setSaving] = useState(false);

  // 🔑 Central save function — backend me save + redux update
  const persist = async (updated) => {
    setAvailability(updated); // instant UI update
    try {
      const { data } = await api.put("/users/availability", { availability: updated });
      // Redux update taaki refresh par bhi data rahe
      dispatch(setUser({ ...user, availability: data }));
    } catch (err) {
      toast.error("Failed to save changes");
    }
  };

  const addDay = () =>
    persist([...availability, { date: "", slots: [{ start: "09:00", end: "10:00" }] }]);

  const removeDay = (i) =>
    persist(availability.filter((_, j) => j !== i));

  const addSlot = (i) =>
    persist(
      availability.map((d, j) =>
        j === i ? { ...d, slots: [...d.slots, { start: "09:00", end: "10:00" }] } : d
      )
    );

  const removeSlot = (dayIdx, slotIdx) =>
    persist(
      availability.map((d, j) =>
        j === dayIdx ? { ...d, slots: d.slots.filter((_, k) => k !== slotIdx) } : d
      )
    );

  const updateDate = (i, value) =>
    persist(availability.map((d, j) => (j === i ? { ...d, date: value } : d)));

  const updateSlot = (dayIdx, slotIdx, key, value) =>
    // date/time change par bhi save (debounce ke bina simple approach)
    persist(
      availability.map((d, j) =>
        j === dayIdx
          ? {
              ...d,
              slots: d.slots.map((x, y) =>
                y === slotIdx ? { ...x, [key]: value } : x
              ),
            }
          : d
      )
    );

  // Manual full save (validation ke sath)
  const save = async () => {
    for (const day of availability) {
      if (!day.date) return toast.error("Select a date for every day");
      for (const slot of day.slots) {
        if (!slot.start || !slot.end) return toast.error("Fill all slot times");
        if (slot.start >= slot.end) return toast.error("End time must be after start");
      }
    }
    setSaving(true);
    const t = toast.loading("Saving availability...");
    try {
      const { data } = await api.put("/users/availability", { availability });
      dispatch(setUser({ ...user, availability: data }));
      toast.success("Availability saved!", { id: t });
    } catch (err) {
      toast.error("Failed to save", { id: t });
    } finally {
      setSaving(false);
    }
  };

  if (user.role !== "freelancer") {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm text-center py-16 px-6">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-600 font-semibold">Freelancers only</p>
          <p className="text-slate-400 text-sm mt-1">Only freelancer accounts can set availability.</p>
        </div>
      </div>
    );
  }

  const totalSlots = availability.reduce((sum, d) => sum + d.slots.length, 0);
  const bookedSlots = availability.reduce(
    (sum, d) => sum + d.slots.filter((s) => s.booked).length,
    0
  );

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="p-6 md:p-7 bg-gradient-to-tr from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-400/20 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-indigo-500/30 text-indigo-200 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
              <Calendar className="w-3 h-3" /> Scheduler
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">Availability Scheduler</h1>
            <p className="text-indigo-200/80 text-sm mt-1">Changes save automatically ✨</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-2 text-center">
              <p className="text-xl font-black">{totalSlots}</p>
              <p className="text-[10px] uppercase tracking-wide text-indigo-200">Slots</p>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-2 text-center">
              <p className="text-xl font-black text-emerald-300">{bookedSlots}</p>
              <p className="text-[10px] uppercase tracking-wide text-indigo-200">Booked</p>
            </div>
          </div>
        </div>
      </div>

      {/* Days */}
      {availability.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center py-16 px-6">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CalendarX className="w-8 h-8 text-indigo-400" />
          </div>
          <p className="text-slate-700 font-semibold">No availability yet</p>
          <p className="text-slate-400 text-sm mt-1 mb-5">Add a day and time slots.</p>
          <button onClick={addDay} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl transition">
            <CalendarPlus className="w-4 h-4" /> Add Your First Day
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {availability.map((day, i) => (
            <div key={i} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <input
                    type="date"
                    className="w-full max-w-[220px] px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold text-slate-700"
                    value={day.date?.slice?.(0, 10) || day.date}
                    onChange={(e) => updateDate(i, e.target.value)}
                  />
                </div>
                <button onClick={() => removeDay(i)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition" title="Remove day">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5">
                {day.slots.map((s, k) => (
                  <div key={k} className={`flex items-center gap-2 sm:gap-3 p-3 rounded-2xl border transition ${s.booked ? "bg-rose-50/50 border-rose-100" : "bg-slate-50/60 border-slate-100"}`}>
                    <Clock className={`w-4 h-4 shrink-0 ${s.booked ? "text-rose-400" : "text-slate-400"}`} />
                    <input type="time" disabled={s.booked} className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition disabled:opacity-60" value={s.start} onChange={(e) => updateSlot(i, k, "start", e.target.value)} />
                    <span className="text-slate-400 font-bold">→</span>
                    <input type="time" disabled={s.booked} className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition disabled:opacity-60" value={s.end} onChange={(e) => updateSlot(i, k, "end", e.target.value)} />
                    <div className="ml-auto flex items-center gap-2">
                      {s.booked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-rose-100 text-rose-700 rounded-full">
                          <CircleCheck className="w-3 h-3" /> Booked
                        </span>
                      ) : (
                        <button onClick={() => removeSlot(i, k)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition" title="Remove slot">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => addSlot(i)} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition">
                <Plus className="w-3.5 h-3.5" /> Add Time Slot
              </button>
            </div>
          ))}
        </div>
      )}

      {availability.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 sticky bottom-4">
          <button onClick={addDay} className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-600 font-semibold px-6 py-3.5 rounded-2xl transition shadow-sm">
            <CalendarPlus className="w-4 h-4" /> Add Day
          </button>
          <button onClick={save} disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold px-6 py-3.5 rounded-2xl transition shadow-lg shadow-indigo-100">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Availability"}
          </button>
        </div>
      )}
    </div>
  );
}