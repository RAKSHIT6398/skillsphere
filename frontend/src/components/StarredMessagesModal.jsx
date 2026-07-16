import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { X, Star, FileText, Image as ImageIcon, Video } from "lucide-react";

export default function StarredMessagesModal({ conversation, currentUser, onClose }) {
  const { data: starred = [], isLoading } = useQuery({
    queryKey: ["starred", conversation?._id],
    queryFn: () => api.get(`/chat/conversations/${conversation._id}/starred`).then(r => r.data),
    enabled: !!conversation?._id,
  });

  const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const isImage = (m) => m.file?.fileType?.startsWith("image/");
  const isVideo = (m) => m.file?.fileType?.startsWith("video/");

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-pink-500 text-white p-6 overflow-hidden">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-all"
          >
            <X size={18} />
          </button>

          <div className="relative flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
              <Star size={24} className="fill-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Starred Messages</h2>
              <p className="text-white/80 text-sm mt-0.5">
                {starred.length} {starred.length === 1 ? "message" : "messages"} saved
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/50">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400">Loading...</div>
          ) : starred.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Star size={36} className="text-amber-400" />
              </div>
              <p className="text-lg font-black text-slate-700">No starred messages</p>
              <p className="text-sm text-slate-500 mt-1">
                Long press a message and tap star to save it here
              </p>
            </div>
          ) : (
            starred.map((m) => {
              const mine = m.sender._id === currentUser._id;
              return (
                <div
                  key={m._id}
                  className={`p-4 rounded-2xl border shadow-sm ${
                    mine 
                      ? "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100 ml-8" 
                      : "bg-white border-slate-200 mr-8"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {m.sender?.avatar ? (
                      <img src={m.sender.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {m.sender?.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-bold text-slate-900">{m.sender?.name}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      {formatDate(m.createdAt)} {formatTime(m.createdAt)}
                    </span>
                    <Star size={12} className="fill-amber-400 text-amber-400 ml-auto" />
                  </div>

                  {m.text && <p className="text-sm text-slate-800 whitespace-pre-wrap">{m.text}</p>}
                  
                  {m.file?.url && isImage(m) && (
                    <img src={m.file.url} alt="" className="rounded-xl mt-2 max-h-48 w-full object-cover" />
                  )}
                  {m.file?.url && isVideo(m) && (
                    <video src={m.file.url} controls className="rounded-xl mt-2 max-h-48 w-full" />
                  )}
                  {m.file?.url && !isImage(m) && !isVideo(m) && (
                    <a href={m.file.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 mt-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                      <FileText size={16} className="text-indigo-600" />
                      <span className="text-sm font-semibold text-slate-700">{m.file.name}</span>
                    </a>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}