import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("analytics");
  const { data: analytics } = useQuery({ queryKey: ["adminAnalytics"], queryFn: () => api.get("/admin/analytics").then((r) => r.data) });
  const { data: users } = useQuery({ queryKey: ["adminUsers"], queryFn: () => api.get("/admin/users").then((r) => r.data) });
  const { data: pendingGigs } = useQuery({ queryKey: ["pendingGigs"], queryFn: () => api.get("/admin/gigs/pending").then((r) => r.data) });
  const { data: payments } = useQuery({ queryKey: ["adminPayments"], queryFn: () => api.get("/admin/payments").then((r) => r.data) });
  const { data: fraud } = useQuery({ queryKey: ["fraud"], queryFn: () => api.get("/admin/fraud-reviews").then((r) => r.data) });
  const { data: disputes } = useQuery({ queryKey: ["adminDisputes"], queryFn: () => api.get("/disputes").then((r) => r.data) });

  const action = async (fn, msg, keys) => { await fn(); toast.success(msg); keys.forEach((k) => qc.invalidateQueries([k])); };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🛡️ Admin Dashboard</h1>
      <div className="flex gap-2 mb-6 flex-wrap">
        {["analytics", "users", "gigs", "payments", "fraud", "disputes"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`btn capitalize ${tab === t ? "bg-brand-500 text-white" : "bg-white border"}`}>{t}</button>
        ))}
      </div>

      {tab === "analytics" && analytics && (
        <>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            {[["Platform Revenue", `₹${analytics.platformRevenue}`], ["Payment Volume", `₹${analytics.paymentVolume}`],
              ["Active Freelancers", analytics.activeFreelancers], ["Job Success Rate", `${analytics.jobSuccessRate}%`]]
              .map(([k, v]) => <div key={k} className="card text-center"><p className="text-2xl font-bold text-brand-600">{v}</p><p className="text-sm text-gray-500">{k}</p></div>)}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold mb-3">Monthly Revenue</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics.monthlyRevenue}>
                  <XAxis dataKey="_id" /><YAxis /><Tooltip /><Bar dataKey="total" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h3 className="font-semibold mb-3">Top Categories</h3>
              {analytics.topCategories.map((c) => (
                <div key={c._id} className="flex justify-between py-1"><span>{c._id}</span><span className="text-gray-400">{c.count}</span></div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === "users" && (
        <div className="card divide-y">
          {users?.map((u) => (
            <div key={u._id} className="py-2 flex justify-between items-center">
              <div><p className="font-medium">{u.name} <span className="badge bg-gray-100">{u.role}</span> {u.isVerifiedBadge && "✔️"}</p>
                <p className="text-xs text-gray-400">{u.email}</p></div>
              <div className="flex gap-2">
                {u.role === "freelancer" && !u.isVerifiedBadge &&
                  <button className="btn-outline !py-1 text-xs" onClick={() => action(() => api.put(`/admin/users/${u._id}/verify-badge`), "Verified!", ["adminUsers"])}>Verify ✔️</button>}
                <button className={`!py-1 text-xs btn ${u.isSuspended ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
                  onClick={() => action(() => api.put(`/admin/users/${u._id}/suspend`), "Updated", ["adminUsers"])}>
                  {u.isSuspended ? "Unsuspend" : "Suspend"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "gigs" && (
        <div className="card divide-y">
          <h3 className="font-semibold pb-2">Pending Approval</h3>
          {pendingGigs?.map((g) => (
            <div key={g._id} className="py-2 flex justify-between items-center">
              <div><p className="font-medium">{g.title}</p><p className="text-xs text-gray-400">by {g.client?.name}</p></div>
              <button className="btn-primary !py-1 text-xs" onClick={() => action(() => api.put(`/admin/gigs/${g._id}/approve`), "Approved!", ["pendingGigs"])}>Approve</button>
            </div>
          ))}
          {!pendingGigs?.length && <p className="text-gray-400 py-4">No pending gigs.</p>}
        </div>
      )}

      {tab === "payments" && (
        <div className="card divide-y">
          {payments?.map((p) => (
            <div key={p._id} className="py-2 flex justify-between text-sm">
              <span>{p.gig?.title} • {p.client?.name} → {p.freelancer?.name}</span>
              <span>₹{p.amount} <span className="badge bg-gray-100">{p.status}</span></span>
            </div>
          ))}
        </div>
      )}

      {tab === "fraud" && (
        <div className="card divide-y">
          <h3 className="font-semibold pb-2">⚠️ Flagged Reviews (Fraud Detection)</h3>
          {fraud?.map((r) => (
            <div key={r._id} className="py-2 flex justify-between items-center text-sm">
              <span>{r.reviewer?.name} → {r.reviewee?.name}: {"⭐".repeat(r.rating)} "{r.comment}"</span>
              <button className="btn-outline !py-1 text-xs" onClick={() => action(() => api.put(`/admin/fraud-reviews/${r._id}/clear`), "Cleared", ["fraud"])}>Mark Genuine</button>
            </div>
          ))}
          {!fraud?.length && <p className="text-gray-400 py-4">No flagged reviews.</p>}
        </div>
      )}

      {tab === "disputes" && (
        <div className="card divide-y">
          {disputes?.map((d) => (
            <div key={d._id} className="py-3">
              <p className="font-medium">{d.gig?.title} — <span className="badge bg-red-100 text-red-700">{d.status}</span></p>
              <p className="text-sm">{d.raisedBy?.name} vs {d.against?.name}: {d.reason}</p>
              {d.evidence?.map((e, i) => <a key={i} href={e} className="text-xs text-brand-600 mr-2" target="_blank" rel="noreferrer">Evidence {i + 1}</a>)}
              {d.status === "open" && (
                <div className="flex gap-2 mt-2">
                  {["resolved-refund", "resolved-release", "closed"].map((res) => (
                    <button key={res} className="btn-outline !py-1 text-xs"
                      onClick={() => action(() => api.put(`/disputes/${d._id}/resolve`, { resolution: res, adminNote: `Admin decision: ${res}` }), "Resolved", ["adminDisputes"])}>
                      {res}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}