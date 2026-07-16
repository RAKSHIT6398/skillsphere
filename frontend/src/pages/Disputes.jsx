import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function Disputes() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ gigId: "", againstId: "", reason: "" });
  const [files, setFiles] = useState([]);
  const { data: disputes } = useQuery({ queryKey: ["disputes"], queryFn: () => api.get("/disputes/mine").then((r) => r.data) });
  const { data: gigs } = useQuery({ queryKey: ["myGigsDispute"], queryFn: () => api.get("/gigs/mine").then((r) => r.data) });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const gig = gigs.find((g) => g._id === form.gigId);
      const fd = new FormData();
      fd.append("gigId", form.gigId);
      fd.append("againstId", gig.client?._id === JSON.parse(localStorage.getItem("user"))._id ? gig.hiredFreelancer?._id : gig.client?._id);
      fd.append("reason", form.reason);
      [...files].forEach((f) => fd.append("evidence", f));
      await api.post("/disputes", fd);
      toast.success("Dispute filed. Admin will review.");
      qc.invalidateQueries(["disputes"]);
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">⚖️ Dispute Resolution</h1>
      <form onSubmit={submit} className="card space-y-3">
        <select className="input" required value={form.gigId} onChange={(e) => setForm({ ...form, gigId: e.target.value })}>
          <option value="">Select gig</option>
          {gigs?.map((g) => <option key={g._id} value={g._id}>{g.title}</option>)}
        </select>
        <textarea className="input" rows={3} placeholder="Describe the issue..." required
          value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
        <button className="btn-primary">File Dispute</button>
      </form>
      <div className="card divide-y">
        <h2 className="font-semibold pb-2">My Disputes</h2>
        {disputes?.map((d) => (
          <div key={d._id} className="py-2">
            <p className="font-medium">{d.gig?.title} — <span className="badge bg-red-100 text-red-700">{d.status}</span></p>
            <p className="text-sm text-gray-500">{d.reason}</p>
            {d.adminNote && <p className="text-sm text-green-600">Admin: {d.adminNote}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}