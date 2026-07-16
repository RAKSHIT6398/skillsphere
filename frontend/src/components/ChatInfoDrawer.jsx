import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import {
  X, Mail, Calendar, MessageSquare, Image as ImageIcon, FileText,
  Shield, Bell, BellOff, Star, Download, User
} from "lucide-react";

export default function ChatInfoDrawer({ conversation, currentUser, onClose }) {
  const other = conversation?.participants?.find(p => p._id !== currentUser._id);

  const { data: info, isLoading } = useQuery({
    queryKey: ["chatInfo", conversation?._id],
    queryFn: () => api.get(`/chat/conversations/${conversation._id}/info`).then(r => r.data),
    enabled: !!conversation?._id,
  });

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric"
  });

  return (
    <div className="fixed inset-0 z-[150] flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-6 overflow-hidden">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-pink-400/20 rounded-full blur-2xl" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-all"
          >
            <X size={18} />
          </button>

          <div className="relative flex flex-col items-center pt-4">
            {other?.avatar ? (
              <img src={other.avatar} alt="" className="w-24 h-24 rounded-3xl object-cover ring-4 ring-white/30 shadow-2xl" />
            ) : (
              <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl font-black ring-4 ring-white/30">
                {other?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <h2 className="text-2xl font-black mt-4">{other?.name}</h2>
            <p className="text-white/80 text-sm mt-1 capitalize flex items-center gap-1">
              <Shield size={12} /> {other?.role || "User"}
            </p>
          </div>
        </div>

        <div className="p-5 space-y-5">
          
          {/* Contact Info */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                <Mail size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">Email</p>
                <p className="text-sm font-bold text-slate-900">{other?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
                <Calendar size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">Member since</p>
                <p className="text-sm font-bold text-slate-900">{formatDate(other?.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          {info?.stats && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={14} className="text-indigo-600" />
                  <p className="text-xs font-bold text-indigo-700 uppercase">Messages</p>
                </div>
                <p className="text-2xl font-black text-slate-900">{info.stats.totalMessages}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={14} className="text-emerald-600" />
                  <p className="text-xs font-bold text-emerald-700 uppercase">Started</p>
                </div>
                <p className="text-sm font-black text-slate-900">{formatDate(info.stats.startedAt)}</p>
              </div>
            </div>
          )}

          {/* Shared Media */}
          {info?.sharedMedia?.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-slate-900 flex items-center gap-2">
                  <ImageIcon size={16} className="text-indigo-600" />
                  Shared Media
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                    {info.sharedMedia.length}
                  </span>
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {info.sharedMedia.slice(0, 9).map((m, i) => (
                  <a
                    key={i}
                    href={m.file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="aspect-square rounded-xl overflow-hidden bg-slate-100 hover:opacity-80 transition-opacity"
                  >
                    {m.file.fileType?.startsWith("video/") ? (
                      <video src={m.file.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={m.file.url} alt="" className="w-full h-full object-cover" />
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Shared Files */}
          {info?.sharedFiles?.length > 0 && (
            <div>
              <h3 className="font-black text-slate-900 flex items-center gap-2 mb-3">
                <FileText size={16} className="text-purple-600" />
                Shared Files
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  {info.sharedFiles.length}
                </span>
              </h3>
              <div className="space-y-2">
                {info.sharedFiles.slice(0, 5).map((f, i) => (
                  <a
                    key={i}
                    href={f.file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                      <FileText size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{f.file.name}</p>
                      <p className="text-xs text-slate-500">{formatDate(f.createdAt)}</p>
                    </div>
                    <Download size={14} className="text-slate-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !info?.sharedMedia?.length && !info?.sharedFiles?.length && (
            <div className="text-center py-8 text-slate-400">
              <ImageIcon size={32} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold">No shared media yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}