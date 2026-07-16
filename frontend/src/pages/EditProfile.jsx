// import { useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import api from "../api/axios";
// import toast from "react-hot-toast";
// import { setUser } from "../features/authSlice";
// import { Link } from "react-router-dom";

// export default function EditProfile() {
//   const { user } = useSelector((s) => s.auth);
//   const dispatch = useDispatch();

//   // 1. Safe Initialization using Optional Chaining (?.) to avoid application crash
//   const [form, setForm] = useState({
//     name: user?.name || "", 
//     bio: user?.bio || "", 
//     hourlyRate: user?.hourlyRate || 0,
//     city: user?.location?.city || "", 
//     skillsText: (user?.skills || []).map((s) => `${s.name}:${s.proficiency}`).join(", "),
//   });
  
//   const [portfolio, setPortfolio] = useState(user?.portfolio || []);

//   const save = async (e) => {
//     e.preventDefault();
//     try {
//       const skills = form.skillsText.split(",")
//         .map((x) => {
//           if (!x.trim()) return null;
//           const [name, proficiency = "intermediate"] = x.split(":").map((s) => s.trim());
//           return name ? { name, proficiency } : null;
//         })
//         .filter(Boolean);

//       const { data } = await api.put("/users/profile", {
//         name: form.name, 
//         bio: form.bio, 
//         hourlyRate: +form.hourlyRate,
//         location: { city: form.city }, 
//         skills, 
//         portfolio,
//       });

//       dispatch(setUser(data));
//       toast.success("Profile updated!");
//     } catch (err) { 
//       toast.error("Update failed"); 
//     }
//   };

//   // 2. Optimized Upload function that syncs Redux state immediately
//   const uploadFile = async (endpoint, file, label) => {
//     if (!file) return; // Prevent uploading if selection is canceled
    
//     const loadingToast = toast.loading(`Uploading ${label}...`);
//     try {
//       const fd = new FormData(); 
//       fd.append("file", file);
      
//       const { data } = await api.put(`/users/${endpoint}`, fd);
      
//       dispatch(setUser(data)); // Live UI updates without manual refresh
//       toast.success(`${label} uploaded!`, { id: loadingToast });
//     } catch (err) {
//       toast.error(`${label} upload failed`, { id: loadingToast });
//     }
//   };

//   // If user object is missing entirely, show a graceful protective text
//   if (!user) return <p className="p-6 text-center">Loading profile configuration...</p>;

//   return (
//     <div className="max-w-2xl mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
//       <form onSubmit={save} className="card space-y-3">
//         <label className="text-sm font-medium">Full Name</label>
//         <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        
//         <label className="text-sm font-medium">Bio</label>
//         <textarea className="input" rows={3} placeholder="Tell us about yourself" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        
//         <div className="grid grid-cols-2 gap-3">
//           <div>
//             <label className="text-sm font-medium">City</label>
//             <input className="input" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
//           </div>
//           <div>
//             <label className="text-sm font-medium">Hourly Rate (₹)</label>
//             <input className="input" type="number" placeholder="Hourly rate ₹" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} />
//           </div>
//         </div>

//         <div>
//           <label className="text-sm font-medium">Skills (comma separated)</label>
//           <input className="input" placeholder="Skills — e.g. React:expert, Node.js:intermediate"
//             value={form.skillsText} onChange={(e) => setForm({ ...form, skillsText: e.target.value })} />
//         </div>

//         <h3 className="font-semibold pt-2">Portfolio</h3>
//         {portfolio.map((p, i) => (
//           <div key={i} className="grid grid-cols-3 gap-2 border-b pb-2 last:border-b-0">
//             <input className="input" placeholder="Title" value={p.title || ""} onChange={(e) => setPortfolio(portfolio.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} />
//             <input className="input" placeholder="Link" value={p.link || ""} onChange={(e) => setPortfolio(portfolio.map((x, j) => j === i ? { ...x, link: e.target.value } : x))} />
//             <input className="input" placeholder="Image URL" value={p.image || ""} onChange={(e) => setPortfolio(portfolio.map((x, j) => j === i ? { ...x, image: e.target.value } : x))} />
//           </div>
//         ))}
//         <button type="button" className="btn-outline text-sm" onClick={() => setPortfolio([...portfolio, { title: "", link: "", image: "" }])}>+ Add portfolio item</button>

//         <div className="grid grid-cols-2 gap-3 pt-4 border-t">
//           <label className="text-sm font-medium">Avatar
//             <input type="file" accept="image/*" className="block mt-1 text-xs" onChange={(e) => uploadFile("avatar", e.target.files?.[0], "Avatar")} />
//           </label>
//           {user.role === "freelancer" && (
//             <label className="text-sm font-medium">Resume
//               <input type="file" accept=".pdf,.doc,.docx" className="block mt-1 text-xs" onChange={(e) => uploadFile("resume", e.target.files?.[0], "Resume")} />
//             </label>
//           )}
//         </div>
        
//         <button className="btn-primary w-full !mt-6">Save Changes</button>
//       </form>
      
//       <Link to="/2fa" className="block text-center mt-4 text-brand-600 text-sm hover:underline">🔐 Setup Two-Factor Authentication</Link>
//     </div>
//   );
// }


// import { useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import api from "../api/axios";
// import toast from "react-hot-toast";
// import { setUser } from "../features/authSlice";
// import { Link } from "react-router-dom";
// import {
//   User,
//   MapPin,
//   IndianRupee,
//   Briefcase,
//   Plus,
//   Trash2,
//   Upload,
//   FileText,
//   Lock,
//   Sparkles,
//   Globe,
//   Image as ImageIcon,
//   CheckCircle,
// } from "lucide-react";

// export default function EditProfile() {
//   const { user } = useSelector((s) => s.auth);
//   const dispatch = useDispatch();

//   // 1. Exact original Initialization
//   const [form, setForm] = useState({
//     name: user?.name || "",
//     bio: user?.bio || "",
//     hourlyRate: user?.hourlyRate || 0,
//     city: user?.location?.city || "",
//     skillsText:
//       (user?.skills || []).map((s) => `${s.name}:${s.proficiency}`).join(", "),
//   });

//   const [portfolio, setPortfolio] = useState(user?.portfolio || []);

//   // Exact original save handler logic
//   const save = async (e) => {
//     e.preventDefault();
//     try {
//       const skills = form.skillsText
//         .split(",")
//         .map((x) => {
//           if (!x.trim()) return null;
//           const [name, proficiency = "intermediate"] = x
//             .split(":")
//             .map((s) => s.trim());
//           return name ? { name, proficiency } : null;
//         })
//         .filter(Boolean);

//       const { data } = await api.put("/users/profile", {
//         name: form.name,
//         bio: form.bio,
//         hourlyRate: +form.hourlyRate,
//         location: { city: form.city },
//         skills,
//         portfolio,
//       });

//       dispatch(setUser(data));
//       toast.success("Profile updated successfully!");
//     } catch (err) {
//       toast.error("Update failed");
//     }
//   };

//   // Exact original upload handler logic
//   const uploadFile = async (endpoint, file, label) => {
//     if (!file) return;

//     const loadingToast = toast.loading(`Uploading ${label}...`);
//     try {
//       const fd = new FormData();
//       fd.append("file", file);

//       const { data } = await api.put(`/users/${endpoint}`, fd);

//       dispatch(setUser(data));
//       toast.success(`${label} uploaded!`, { id: loadingToast });
//     } catch (err) {
//       toast.error(`${label} upload failed`, { id: loadingToast });
//     }
//   };

//   const removePortfolioItem = (index) => {
//     setPortfolio(portfolio.filter((_, i) => i !== index));
//   };

//   // Parsing skills in real-time for live visual badge preview
//   const parsedSkillsPreview = form.skillsText
//     .split(",")
//     .map((x) => {
//       const [name, level] = x.split(":").map((s) => s.trim());
//       return name ? { name, level: level || "intermediate" } : null;
//     })
//     .filter(Boolean);

//   if (!user) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
//         <p className="font-medium text-sm">Loading profile configuration...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 space-y-6">
//       {/* Header Banner */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
//         <div>
//           <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
//             Edit Profile
//           </h1>
//           <p className="text-slate-500 text-sm mt-1">
//             Manage your public info, portfolio items, and skills
//           </p>
//         </div>
//         <Link
//           to="/2fa"
//           className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors shadow-sm"
//         >
//           <Lock className="w-4 h-4 text-indigo-600" />
//           <span>Setup Two-Factor Authentication</span>
//         </Link>
//       </div>

//       <form onSubmit={save} className="space-y-6">
//         {/* Card 1: Main Details */}
//         <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
//           <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
//             <User className="w-5 h-5 text-indigo-600" />
//             Basic Information
//           </h2>

//           <div className="space-y-4">
//             <div>
//               <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
//                 Full Name
//               </label>
//               <input
//                 className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
//                 required
//                 value={form.name}
//                 onChange={(e) => setForm({ ...form, name: e.target.value })}
//                 placeholder="Your full name"
//               />
//             </div>

//             <div>
//               <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
//                 Bio
//               </label>
//               <textarea
//                 className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none"
//                 rows={3}
//                 placeholder="Tell us about yourself..."
//                 value={form.bio}
//                 onChange={(e) => setForm({ ...form, bio: e.target.value })}
//               />
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
//                   City
//                 </label>
//                 <div className="relative">
//                   <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
//                   <input
//                     className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
//                     placeholder="e.g. Mumbai"
//                     value={form.city}
//                     onChange={(e) => setForm({ ...form, city: e.target.value })}
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
//                   Hourly Rate (₹)
//                 </label>
//                 <div className="relative">
//                   <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
//                   <input
//                     className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
//                     type="number"
//                     placeholder="Hourly rate"
//                     value={form.hourlyRate}
//                     onChange={(e) =>
//                       setForm({ ...form, hourlyRate: e.target.value })
//                     }
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Card 2: Media & Files */}
//         <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
//           <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
//             <Upload className="w-5 h-5 text-indigo-600" />
//             Media & Documents
//           </h2>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* Avatar Upload Container */}
//             <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center gap-4">
//               {user.avatar ? (
//                 <img
//                   src={user.avatar}
//                   alt="Avatar"
//                   className="w-14 h-14 rounded-full object-cover border border-slate-200 shadow-sm"
//                 />
//               ) : (
//                 <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
//                   {user.name?.[0] || "U"}
//                 </div>
//               )}
//               <div className="flex-1 min-w-0">
//                 <span className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
//                   Profile Avatar
//                 </span>
//                 <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100 transition-all shadow-sm">
//                   <Upload className="w-3.5 h-3.5 text-slate-500" />
//                   Choose Image
//                   <input
//                     type="file"
//                     accept="image/*"
//                     className="hidden"
//                     onChange={(e) =>
//                       uploadFile("avatar", e.target.files?.[0], "Avatar")
//                     }
//                   />
//                 </label>
//               </div>
//             </div>

//             {/* Resume Upload Container (Freelancers only) */}
//             {user.role === "freelancer" && (
//               <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center gap-4">
//                 <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
//                   <FileText className="w-6 h-6" />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <span className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
//                     Resume Document
//                   </span>
//                   <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100 transition-all shadow-sm">
//                     <Upload className="w-3.5 h-3.5 text-slate-500" />
//                     Upload PDF / Doc
//                     <input
//                       type="file"
//                       accept=".pdf,.doc,.docx"
//                       className="hidden"
//                       onChange={(e) =>
//                         uploadFile("resume", e.target.files?.[0], "Resume")
//                       }
//                     />
//                   </label>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Card 3: Skills Section */}
//         <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
//           <div className="flex items-center justify-between">
//             <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
//               <Sparkles className="w-5 h-5 text-indigo-600" />
//               Skills & Expertise
//             </h2>
//             <span className="text-xs text-slate-400">
//               Format: <code className="bg-slate-100 px-1 rounded">Name:level</code>
//             </span>
//           </div>

//           <div>
//             <input
//               className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
//               placeholder="React:expert, Node.js:intermediate, Tailwind:beginner"
//               value={form.skillsText}
//               onChange={(e) => setForm({ ...form, skillsText: e.target.value })}
//             />
//           </div>

//           {/* Interactive Skill Badges Preview */}
//           {parsedSkillsPreview.length > 0 && (
//             <div className="flex flex-wrap gap-2 pt-1">
//               {parsedSkillsPreview.map((skill, idx) => (
//                 <span
//                   key={idx}
//                   className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium"
//                 >
//                   <CheckCircle className="w-3 h-3 text-indigo-500" />
//                   {skill.name}
//                   <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-100/60 px-1.5 py-0.5 rounded">
//                     {skill.level}
//                   </span>
//                 </span>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Card 4: Portfolio */}
//         <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
//           <div className="flex items-center justify-between">
//             <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
//               <Briefcase className="w-5 h-5 text-indigo-600" />
//               Portfolio Highlights
//             </h2>
//             <button
//               type="button"
//               className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all"
//               onClick={() =>
//                 setPortfolio([...portfolio, { title: "", link: "", image: "" }])
//               }
//             >
//               <Plus className="w-3.5 h-3.5" />
//               Add Project
//             </button>
//           </div>

//           {portfolio.length === 0 ? (
//             <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl">
//               <p className="text-sm text-slate-400">No portfolio items added yet.</p>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {portfolio.map((p, i) => (
//                 <div
//                   key={i}
//                   className="group relative grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50/70 border border-slate-200 rounded-xl transition-all hover:bg-slate-50"
//                 >
//                   <div className="relative">
//                     <input
//                       className="w-full pl-3 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
//                       placeholder="Project Title"
//                       value={p.title || ""}
//                       onChange={(e) =>
//                         setPortfolio(
//                           portfolio.map((x, j) =>
//                             j === i ? { ...x, title: e.target.value } : x
//                           )
//                         )
//                       }
//                     />
//                   </div>

//                   <div className="relative">
//                     <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
//                     <input
//                       className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
//                       placeholder="Project Link"
//                       value={p.link || ""}
//                       onChange={(e) =>
//                         setPortfolio(
//                           portfolio.map((x, j) =>
//                             j === i ? { ...x, link: e.target.value } : x
//                           )
//                         )
//                       }
//                     />
//                   </div>

//                   <div className="flex items-center gap-2">
//                     <div className="relative flex-1">
//                       <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
//                       <input
//                         className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
//                         placeholder="Image URL"
//                         value={p.image || ""}
//                         onChange={(e) =>
//                           setPortfolio(
//                             portfolio.map((x, j) =>
//                               j === i ? { ...x, image: e.target.value } : x
//                             )
//                           )
//                         }
//                       />
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => removePortfolioItem(i)}
//                       className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
//                       title="Remove project"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Submit Section */}
//         <button
//           type="submit"
//           className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
//         >
//           <span>Save Changes</span>
//         </button>
//       </form>
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import api from "../api/axios";
import toast from "react-hot-toast";
import { setUser } from "../features/authSlice";
import { Link } from "react-router-dom";
import {
  User,
  MapPin,
  IndianRupee,
  Briefcase,
  Plus,
  Trash2,
  Upload,
  FileText,
  Lock,
  Sparkles,
  Globe,
  Image as ImageIcon,
  Shield,
  RotateCcw,
  Loader2,
  X,
  Check,BadgeCheck,Eye,
} from "lucide-react";

export default function EditProfile() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("basics");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  // Interactive skill builder inputs
  const [newSkill, setNewSkill] = useState("");
  const [newProficiency, setNewProficiency] = useState("intermediate");

  // Form states
  const [form, setForm] = useState({ name: "", bio: "", hourlyRate: 0, city: "" });
  const [skills, setSkills] = useState([]);
  const [portfolio, setPortfolio] = useState([]);

  // Sync state with Redux whenever user loads/updates
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        bio: user.bio || "",
        hourlyRate: user.hourlyRate || 0,
        city: user.location?.city || "",
      });
      setSkills(user.skills || []);
      setPortfolio(user.portfolio || []);
    }
  }, [user]);

  // ---------- Save Profile ----------
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const saveToast = toast.loading("Updating your profile...");
    try {
      const { data } = await api.put("/users/profile", {
        name: form.name,
        bio: form.bio,
        hourlyRate: +form.hourlyRate,
        location: { city: form.city },
        skills,
        portfolio,
      });
      dispatch(setUser({ ...user, ...data }));
      toast.success("Profile updated successfully!", { id: saveToast });
    } catch (err) {
      toast.error("Failed to update profile", { id: saveToast });
    } finally {
      setSaving(false);
    }
  };

  // ---------- Bulletproof File Upload ----------
  const uploadFile = async (endpoint, e, label) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (endpoint === "avatar") setUploadingAvatar(true);
    if (endpoint === "resume") setUploadingResume(true);

    const loadingToast = toast.loading(`Uploading ${label}...`);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const { data } = await api.put(`/users/${endpoint}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // merge to keep role/token & other fields safe
      dispatch(setUser({ ...user, ...data }));
      toast.success(`${label} updated live!`, { id: loadingToast });
    } catch (err) {
      toast.error(`${label} upload failed`, { id: loadingToast });
    } finally {
      e.target.value = ""; // reset so same file can be re-selected
      if (endpoint === "avatar") setUploadingAvatar(false);
      if (endpoint === "resume") setUploadingResume(false);
    }
  };

  // ---------- Skills ----------
  const addSkill = () => {
    if (!newSkill.trim()) return;
    if (skills.some((s) => s.name.toLowerCase() === newSkill.trim().toLowerCase())) {
      toast.error("This skill is already added!");
      return;
    }
    setSkills([...skills, { name: newSkill.trim(), proficiency: newProficiency }]);
    setNewSkill("");
  };
  const removeSkill = (i) => setSkills(skills.filter((_, idx) => idx !== i));

  // ---------- Portfolio ----------
  const updatePortfolio = (i, key, value) =>
    setPortfolio(portfolio.map((x, j) => (j === i ? { ...x, [key]: value } : x)));
  const removePortfolio = (i) => setPortfolio(portfolio.filter((_, idx) => idx !== i));

  // ---------- Reset ----------
  const handleReset = () => {
    if (window.confirm("Discard all unsaved changes?")) {
      setForm({
        name: user.name || "",
        bio: user.bio || "",
        hourlyRate: user.hourlyRate || 0,
        city: user.location?.city || "",
      });
      setSkills(user.skills || []);
      setPortfolio(user.portfolio || []);
      toast.success("Changes discarded");
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium text-sm">Loading profile...</p>
      </div>
    );
  }

  const tabs = [
    { id: "basics", label: "Basics", icon: User },
    { id: "skills", label: "Skills", icon: Sparkles },
    { id: "portfolio", label: "Portfolio", icon: Briefcase },
    { id: "uploads", label: "Uploads", icon: Upload },
  ];

  const profColor = (p) =>
    p === "expert"
      ? "bg-rose-50 text-rose-600"
      : p === "intermediate"
      ? "bg-amber-50 text-amber-600"
      : "bg-emerald-50 text-emerald-600";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-slate-800">
      {/* Header */}
      <div className="mb-8 p-6 md:p-8 bg-gradient-to-tr from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-400/20 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-indigo-500/30 text-indigo-200 border border-indigo-500/20 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
              <Sparkles className="w-3 h-3" /> Creator Hub
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold mt-2 tracking-tight">Edit Your Profile</h1>
            <p className="text-indigo-200/80 text-sm mt-1">Make your profile stand out to clients.</p>
          </div>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-semibold transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Discard Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT: Tabs + Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-1.5 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[110px] inline-flex items-center justify-center gap-1.5 py-3 px-3 text-xs md:text-sm font-semibold rounded-2xl transition-all ${
                    activeTab === tab.id
                      ? "bg-white text-indigo-600 shadow-md border border-slate-100"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={save} className="p-6 md:p-8 space-y-6">
            {/* TAB: BASICS */}
            {activeTab === "basics" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Full Name</label>
                  <input
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Short Bio</label>
                  <textarea
                    rows={4}
                    placeholder="Tell your story, experience & what you bring..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none resize-none"
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Location</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        placeholder="Mumbai, Maharashtra"
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Hourly Rate (₹)</label>
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        placeholder="e.g. 1500"
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                        value={form.hourlyRate}
                        onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SKILLS */}
            {activeTab === "skills" && (
              <div className="space-y-6">
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-4">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Add Skill</span>
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      placeholder="Skill name (e.g. React, Figma)"
                      value={newSkill}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="flex-grow px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 outline-none"
                    />
                    <select
                      value={newProficiency}
                      onChange={(e) => setNewProficiency(e.target.value)}
                      className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 focus:border-indigo-500 outline-none font-semibold"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="expert">Expert</option>
                    </select>
                    <button
                      type="button"
                      onClick={addSkill}
                      className="inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl transition"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Your Skills ({skills.length})</span>
                  <div className="flex flex-wrap gap-2.5">
                    {skills.length > 0 ? (
                      skills.map((s, i) => (
                        <div key={i} className="group inline-flex items-center gap-2 pl-3.5 pr-2 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 transition">
                          <span>{s.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${profColor(s.proficiency)}`}>
                            {s.proficiency}
                          </span>
                          <button type="button" onClick={() => removeSkill(i)} className="text-slate-400 hover:text-rose-500 p-0.5 hover:bg-white rounded transition">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 italic">No skills yet. Use the builder above.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PORTFOLIO */}
            {activeTab === "portfolio" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">My Showcases</span>
                  <button
                    type="button"
                    onClick={() => setPortfolio([...portfolio, { title: "", link: "", image: "" }])}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Project
                  </button>
                </div>

                {portfolio.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                    <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">Add portfolio items to build client trust.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {portfolio.map((p, i) => (
                      <div key={i} className="relative bg-white p-5 rounded-3xl border border-slate-200/80 hover:border-indigo-400/50 hover:shadow-lg transition-all space-y-3">
                        <button
                          type="button"
                          onClick={() => removePortfolio(i)}
                          className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 p-1.5 bg-slate-50 rounded-xl hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold">{i + 1}</div>
                        <input
                          className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-transparent focus:border-indigo-500 focus:bg-white outline-none font-semibold"
                          placeholder="Project Title"
                          value={p.title || ""}
                          onChange={(e) => updatePortfolio(i, "title", e.target.value)}
                        />
                        <div className="relative">
                          <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-transparent focus:border-indigo-500 focus:bg-white outline-none"
                            placeholder="Project link"
                            value={p.link || ""}
                            onChange={(e) => updatePortfolio(i, "link", e.target.value)}
                          />
                        </div>
                        <div className="relative">
                          <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-transparent focus:border-indigo-500 focus:bg-white outline-none"
                            placeholder="Thumbnail image URL"
                            value={p.image || ""}
                            onChange={(e) => updatePortfolio(i, "image", e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: UPLOADS */}
           {/* TAB: UPLOADS */}
{activeTab === "uploads" && (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Avatar */}
      <div className="border-2 border-dashed border-slate-200 hover:border-indigo-500 p-6 rounded-3xl text-center flex flex-col items-center justify-center transition bg-slate-50/50 group">
        <div className="w-20 h-20 rounded-3xl overflow-hidden border-4 border-white shadow-xl mb-4 group-hover:scale-105 transition-all">
          {user.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-bold">
              {user.name?.[0] || "U"}
            </div>
          )}
        </div>
        <span className="text-sm font-bold text-slate-700">Display Photo</span>
        <p className="text-xs text-slate-400 mt-1 mb-4">Change your avatar image</p>
        <label className={`inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-indigo-500 text-xs font-bold text-slate-600 hover:text-indigo-600 px-5 py-3 rounded-2xl cursor-pointer transition shadow-sm ${uploadingAvatar ? "opacity-60 pointer-events-none" : ""}`}>
          {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploadingAvatar ? "Uploading..." : "Upload Image"}
          <input type="file" accept="image/*" className="hidden" disabled={uploadingAvatar} onChange={(e) => uploadFile("avatar", e, "Avatar")} />
        </label>
      </div>

      {/* 🔥 RESUME with STATUS FEEDBACK */}
      {user.role === "freelancer" ? (
        <div className={`border-2 rounded-3xl p-6 text-center flex flex-col items-center justify-center transition relative overflow-hidden ${
          user.resume
            ? "border-emerald-200 bg-emerald-50/40"
            : "border-dashed border-slate-200 hover:border-indigo-500 bg-slate-50/50"
        }`}>
          {/* Icon — uploaded ho toh green check wala */}
          <div className={`w-16 h-16 shadow-md border rounded-2xl flex items-center justify-center mb-4 transition ${
            user.resume
              ? "bg-emerald-500 border-emerald-400 text-white"
              : "bg-white border-slate-100 text-emerald-600"
          }`}>
            {uploadingResume ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : user.resume ? (
              <Check className="w-7 h-7" />
            ) : (
              <FileText className="w-7 h-7" />
            )}
          </div>

          <span className="text-sm font-bold text-slate-700">Resume / CV</span>

          {/* 🔥 STATUS LINE — confusion khatam */}
          {user.resume ? (
            <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold">
              <BadgeCheck className="w-3.5 h-3.5" /> Resume saved ✓
            </span>
          ) : (
            <p className="text-xs text-slate-400 mt-1.5">Upload PDF for proposals</p>
          )}

          {/* File name extract karke dikhao */}
          {user.resume && (
            <p className="text-[11px] text-slate-500 mt-1 font-mono truncate max-w-[180px]">
              📄 {user.resume.split("/").pop()?.slice(0, 20) || "resume.pdf"}
            </p>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-2 mt-4">
            {user.resume && (
              <a
                href={user.resume}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition shadow-sm"
              >
                <Eye className="w-3.5 h-3.5" /> View
              </a>
            )}
            <label className={`inline-flex items-center gap-2 bg-white border text-xs font-bold px-4 py-2.5 rounded-2xl cursor-pointer transition shadow-sm ${
              uploadingResume
                ? "opacity-60 pointer-events-none border-slate-200 text-slate-400"
                : user.resume
                ? "border-emerald-200 hover:border-emerald-500 text-emerald-600 hover:text-emerald-700"
                : "border-slate-200 hover:border-indigo-500 text-slate-600 hover:text-indigo-600"
            }`}>
              {uploadingResume ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploadingResume ? "Uploading..." : user.resume ? "Replace" : "Select Document"}
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" disabled={uploadingResume} onChange={(e) => uploadFile("resume", e, "Resume")} />
            </label>
          </div>

          {/* 🔥 Replace hone pe previous se different dikhe — timestamp */}
          {user.resume && !uploadingResume && (
            <p className="text-[10px] text-slate-400 mt-3">
            
            </p>
          )}
        </div>
      ) : (
        <div className="border border-slate-100 bg-slate-50/50 p-6 rounded-3xl flex items-center justify-center text-center">
          <p className="text-xs text-slate-400 max-w-[200px]">Only freelancer accounts can upload a CV.</p>
        </div>
      )}
    </div>

    {/* 🔥 LIVE PREVIEW SIDEBAR mein bhi resume status add karo (optional, neeche bataya) */}
  </div>
)}

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-slate-100 gap-4">
              <Link to="/2fa" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition">
                <Shield className="w-4 h-4" /> Security & 2FA Settings
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-extrabold px-10 py-4 rounded-2xl transition-all shadow-lg shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: Live Preview */}
        <div className="bg-slate-50/70 border border-slate-100 p-6 rounded-3xl lg:sticky lg:top-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Live Client View</h3>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Live</span>
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 space-y-5">
            <div className="flex items-center gap-4">
              {user.avatar ? (
                <img className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-50" src={user.avatar} alt="preview" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold ring-4 ring-indigo-50">
                  {form.name?.[0] || "U"}
                </div>
              )}
              <div>
                <h4 className="font-extrabold text-slate-800 text-lg leading-snug">{form.name || "Your Name"}</h4>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {form.city || "Remote"}
                </p>
              </div>
            </div>

            {form.bio ? (
              <p className="text-slate-600 text-xs leading-relaxed italic border-l-2 border-indigo-500 pl-3">"{form.bio}"</p>
            ) : (
              <p className="text-slate-400 text-xs italic">Your bio will preview here...</p>
            )}

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl">
              <span className="text-xs text-slate-500 font-semibold">Standard Rate</span>
              <span className="text-sm font-black text-indigo-600">₹{form.hourlyRate || "0"}/hr</span>
            </div>

            <div className="space-y-2">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Top Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {skills.length > 0 ? (
                  <>
                    {skills.slice(0, 4).map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-extrabold uppercase">{s.name}</span>
                    ))}
                    {skills.length > 4 && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold">+{skills.length - 4} more</span>
                    )}
                  </>
                ) : (
                  <span className="text-[10px] text-slate-400 italic">Add skills to render...</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-white p-4 rounded-2xl border border-slate-100">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Showcases</span>
              <span className="text-lg font-black text-slate-800">{portfolio.filter((p) => p.title).length}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Role</span>
              <span className="text-lg font-black text-indigo-600 capitalize">{user.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}