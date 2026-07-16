import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function CreateGig() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", category: "Web Development",
    skillsRequired: "", budgetMin: "", budgetMax: "", city: "",
    deadline: "", experienceLevel: "intermediate",
  });
  const [milestones, setMilestones] = useState([{ title: "", amount: "", dueDate: "" }]);
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data: gig } = await api.post("/gigs", {
        ...form,
        skillsRequired: form.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean),
        budgetMin: +form.budgetMin,
        budgetMax: +form.budgetMax,
        location: { city: form.city },
        milestones: milestones.filter((m) => m.title).map((m) => ({ ...m, amount: +m.amount })),
      });
      if (files.length) {
        const fd = new FormData();
        [...files].forEach((f) => fd.append("files", f));
        await api.post(`/gigs/${gig._id}/attachments`, fd);
      }
      toast.success("Gig submitted for admin approval! 🎉");
      nav(`/gigs/${gig._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const removeMilestone = (i) => setMilestones(milestones.filter((_, j) => j !== i));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <span>🚀</span> New Project
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Post a New Gig
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Fill in the details below and publish your gig for talented freelancers.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">

          {/* ── Section 1: Basic Info ── */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 transition hover:shadow-md">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 text-sm font-bold">1</span>
              <h2 className="font-semibold text-gray-800">Basic Information</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gig Title *</label>
              <input
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="e.g. Build a React dashboard for SaaS analytics"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                rows={4}
                placeholder="Describe the project scope, deliverables, and expectations..."
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills Required</label>
              <input
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="React, Node.js, MongoDB, Tailwind CSS"
                value={form.skillsRequired}
                onChange={(e) => setForm({ ...form, skillsRequired: e.target.value })}
              />
              <p className="text-xs text-gray-400 mt-1">Separate multiple skills with commas</p>
            </div>
          </section>

          {/* ── Section 2: Category & Level ── */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 transition hover:shadow-md">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 text-sm font-bold">2</span>
              <h2 className="font-semibold text-gray-800">Category & Level</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {["Web Development", "Mobile Apps", "Design", "Writing", "Marketing", "Video", "Data Science","AI & Data Science","Other"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                <select
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
                  value={form.experienceLevel}
                  onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                >
                  {["beginner", "intermediate", "expert"].map((l) => (
                    <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* ── Section 3: Budget & Location ── */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 transition hover:shadow-md">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 text-amber-600 text-sm font-bold">3</span>
              <h2 className="font-semibold text-gray-800">Budget & Location</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Budget (₹) *</label>
                <input
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  type="number"
                  placeholder="5,000"
                  required
                  value={form.budgetMin}
                  onChange={(e) => setForm({ ...form, budgetMin: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Budget (₹) *</label>
                <input
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  type="number"
                  placeholder="25,000"
                  required
                  value={form.budgetMax}
                  onChange={(e) => setForm({ ...form, budgetMax: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📍 City (Hyperlocal)</label>
                <input
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="e.g. Bangalore, Pune, Delhi"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📅 Deadline</label>
                <input
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* ── Section 4: Milestones ── */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 transition hover:shadow-md">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-100 text-violet-600 text-sm font-bold">4</span>
              <h2 className="font-semibold text-gray-800">Milestones</h2>
            </div>
            <p className="text-xs text-gray-400 -mt-2">Break your project into payable phases</p>

            <div className="space-y-3">
              {milestones.map((m, i) => (
                <div key={i} className="relative group flex items-start gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="mt-2.5 flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                    <input
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none transition"
                      placeholder="Milestone title"
                      value={m.title}
                      onChange={(e) => setMilestones(milestones.map((x, j) => j === i ? { ...x, title: e.target.value } : x))}
                    />
                    <input
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none transition"
                      type="number"
                      placeholder="Amount ₹"
                      value={m.amount}
                      onChange={(e) => setMilestones(milestones.map((x, j) => j === i ? { ...x, amount: e.target.value } : x))}
                    />
                    <input
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none transition"
                      type="date"
                      value={m.dueDate}
                      onChange={(e) => setMilestones(milestones.map((x, j) => j === i ? { ...x, dueDate: e.target.value } : x))}
                    />
                  </div>
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMilestone(i)}
                      className="mt-1 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition text-lg leading-none"
                      title="Remove milestone"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              className="flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-800 transition"
              onClick={() => setMilestones([...milestones, { title: "", amount: "", dueDate: "" }])}
            >
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-violet-100 text-sm">+</span>
              Add another milestone
            </button>
          </section>

          {/* ── Section 5: Attachments ── */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 transition hover:shadow-md">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-rose-100 text-rose-600 text-sm font-bold">5</span>
              <h2 className="font-semibold text-gray-800">Attachments</h2>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); setFiles(e.dataTransfer.files); }}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer
                ${dragOver ? "border-indigo-400 bg-indigo-50" : "border-gray-200 hover:border-gray-300 bg-gray-50"}`}
            >
              <input
                type="file"
                multiple
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => setFiles(e.target.files)}
              />
              <div className="text-3xl mb-2">📎</div>
              <p className="text-sm font-medium text-gray-700">
                Drag & drop files here, or <span className="text-indigo-600 underline">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOC, PNG, JPG up to 10MB</p>

              {files.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 justify-center">
                  {[...files].map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-600 shadow-sm">
                      📄 {f.name.length > 20 ? f.name.slice(0, 20) + "…" : f.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── Submit ── */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => nav(-1)}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              🚀 Publish Gig
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}