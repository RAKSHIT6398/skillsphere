import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import api from "../api/axios";
import { getSocket } from "../api/socket";
import toast from "react-hot-toast";
import {
  Send, Paperclip, Check, CheckCheck, MessageSquare, FileText,
  MoreVertical, Trash2, AlertTriangle, Smile, Pencil, X, Search, 
  Phone, Video, Info, ArrowLeft, Sparkles, Zap, Circle, Star
} from "lucide-react";
import CallModal from "../components/CallModal";
import ChatInfoDrawer from "../components/ChatInfoDrawer";
import StarredMessagesModal from "../components/StarredMessagesModal";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "🎉"];

export default function Chat() {
  const { user } = useSelector((s) => s.auth);
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [online, setOnline] = useState([]);
  const [sending, setSending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [showEmojiInput, setShowEmojiInput] = useState(false);

  const [activeMsgMenu, setActiveMsgMenu] = useState(null);
  const [emojiPickerFor, setEmojiPickerFor] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null);
  const [deleteMsgTarget, setDeleteMsgTarget] = useState(null);

  // ✅ NEW STATES for Call, Chat Info, Starred
  const [callState, setCallState] = useState({ status: "idle", type: null, callId: null, callerName: null, callerAvatar: null });
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [showStarred, setShowStarred] = useState(false);

  const fileRef = useRef();
  const bottomRef = useRef();
  const menuRef = useRef();
  const activeRef = useRef(active);
  const socket = getSocket();

  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    api.get("/chat/conversations").then((r) => setConversations(r.data));
  }, []);

  // ═══ Socket events ═══
  useEffect(() => {
    if (!socket) return;

    const onMsg = (m) => {
      const currentActive = activeRef.current;
      if (m.conversation === currentActive?._id) {
        setMessages((p) => [...p, m]);
        // Auto-mark as read if chat is open
        if (m.sender?._id !== user._id) {
          api.post(`/chat/conversations/${currentActive._id}/read`).catch(() => {});
        }
      }
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c._id !== m.conversation) return c;
          const isOpen = currentActive?._id === c._id;
          const isMine = m.sender?._id === user._id;
          return {
            ...c,
            lastMessage: m.text || "📎 File",
            lastMessageAt: m.createdAt || new Date().toISOString(),
            unreadCount: isOpen || isMine ? 0 : (c.unreadCount || 0) + 1,
          };
        });
        return updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      });
    };

    const onMsgUpdate = (updated) => {
      setMessages((p) => p.map((m) => (m._id === updated._id ? updated : m)));
    };
    const onMsgDelete = ({ messageId }) => {
      setMessages((p) =>
        p.map((m) => m._id === messageId
          ? { ...m, deletedForEveryone: true, text: "", file: null }
          : m
        )
      );
    };

    // ✅ NEW: Real-time read receipt
    const onMessagesRead = ({ conversationId, by }) => {
      if (conversationId === activeRef.current?._id) {
        setMessages((p) =>
          p.map((m) => {
            if (!m.readBy?.includes(by)) {
              return { ...m, readBy: [...(m.readBy || []), by] };
            }
            return m;
          })
        );
      }
    };

    // ✅ NEW: Incoming call handler
    const onIncomingCall = ({ from, callerName, callerAvatar, callType, callId }) => {
      const currentActive = activeRef.current;
      // Accept only if we're chatting with the caller OR no chat is open
      if (currentActive) {
        const otherId = currentActive.participants?.find(p => p._id !== user._id)?._id;
        if (otherId !== from) {
          // Auto reject if chatting with someone else
          socket.emit("call-rejected", { to: from, callId });
          return;
        }
      }
      setCallState({
        status: "ringing",
        type: callType,
        callId,
        callerName,
        callerAvatar,
        callerId: from,
      });
    };

    socket.on("new-message", onMsg);
    socket.on("message-updated", onMsgUpdate);
    socket.on("message-deleted", onMsgDelete);
    socket.on("messages-read", onMessagesRead);
    socket.on("incoming-call", onIncomingCall);
    socket.on("typing", ({ user: u }) => setTypingUser(u));
    socket.on("stop-typing", () => setTypingUser(null));
    socket.on("online-users", (users) => setOnline(users));

    if (socket.connected) socket.emit("get-online-users");
    else socket.once("connect", () => socket.emit("get-online-users"));

    return () => {
      socket.off("new-message", onMsg);
      socket.off("message-updated", onMsgUpdate);
      socket.off("message-deleted", onMsgDelete);
      socket.off("messages-read", onMessagesRead);
      socket.off("incoming-call", onIncomingCall);
      socket.off("typing");
      socket.off("stop-typing");
      socket.off("online-users");
    };
  }, [socket, user._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (!e.target.closest("[data-msg-action]")) {
        setActiveMsgMenu(null);
        setEmojiPickerFor(null);
      }
      if (!e.target.closest("[data-emoji-input]")) {
        setShowEmojiInput(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openConv = async (conv) => {
    if (active) socket?.emit("leave-conversation", active._id);
    setActive(conv);
    setMenuOpen(false);
    socket?.emit("join-conversation", conv._id);
    setConversations((prev) =>
      prev.map((c) => (c._id === conv._id ? { ...c, unreadCount: 0 } : c))
    );
    try {
      const { data } = await api.get(`/chat/conversations/${conv._id}/messages`);
      setMessages(data);
      await api.post(`/chat/conversations/${conv._id}/read`).catch(() => {});
    } catch (err) {
      toast.error("Failed to load messages");
    }
  };

  const deleteConversation = async () => {
    if (!active) return;
    setDeleting(true);
    try {
      await api.delete(`/chat/conversations/${active._id}`);
      toast.success("Chat deleted successfully");
      setConversations((prev) => prev.filter((c) => c._id !== active._id));
      setActive(null);
      setMessages([]);
      setShowDeleteModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete chat");
    } finally {
      setDeleting(false);
    }
  };

  const sendText = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (editingMsg) {
      try {
        const { data } = await api.put(`/chat/messages/${editingMsg._id}`, { text });
        setMessages((p) => p.map((m) => (m._id === data._id ? data : m)));
        setEditingMsg(null);
        setText("");
      } catch {
        toast.error("Edit failed");
      }
      return;
    }
    try {
      const fd = new FormData();
      fd.append("text", text);
      await api.post(`/chat/conversations/${active._id}/messages`, fd);
      setText("");
      socket?.emit("stop-typing", { conversationId: active._id });
    } catch (err) {
      toast.error(err.response?.data?.message || "Message failed");
    }
  };

  const sendFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) return toast.error("Max 25MB allowed");
    setSending(true);
    const loadingToast = toast.loading("Uploading file... ⏳");
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (text.trim()) fd.append("text", text);
      await api.post(`/chat/conversations/${active._id}/messages`, fd);
      setText("");
      toast.success("Sent! 📎", { id: loadingToast });
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed", { id: loadingToast });
    } finally {
      setSending(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const reactToMessage = async (msgId, emoji) => {
    setEmojiPickerFor(null);
    setActiveMsgMenu(null);
    try {
      const { data } = await api.post(`/chat/messages/${msgId}/react`, { emoji });
      setMessages((p) => p.map((m) => (m._id === data._id ? data : m)));
    } catch {
      toast.error("Reaction failed");
    }
  };

  // ✅ NEW: Star / Unstar message
  const toggleStar = async (msgId) => {
    setActiveMsgMenu(null);
    try {
      const { data } = await api.post(`/chat/messages/${msgId}/star`);
      setMessages((p) => p.map((m) => (m._id === data.message._id ? data.message : m)));
      toast.success(data.starred ? "Message starred ⭐" : "Star removed");
    } catch {
      toast.error("Failed to star message");
    }
  };

  const deleteForMe = async (msgId) => {
    setActiveMsgMenu(null);
    try {
      await api.post(`/chat/messages/${msgId}/delete-for-me`);
      setMessages((p) => p.filter((m) => m._id !== msgId));
    } catch {
      toast.error("Delete failed");
    }
  };

  const deleteForEveryone = async (msgId) => {
    setActiveMsgMenu(null);
    setDeleteMsgTarget(null);
    try {
      await api.delete(`/chat/messages/${msgId}`);
      setMessages((p) =>
        p.map((m) => m._id === msgId
          ? { ...m, deletedForEveryone: true, text: "", file: null }
          : m
        )
      );
    } catch {
      toast.error("Delete failed");
    }
  };

  const startEdit = (m) => {
    setEditingMsg({ _id: m._id, text: m.text });
    setText(m.text);
    setActiveMsgMenu(null);
  };
  const cancelEdit = () => { setEditingMsg(null); setText(""); };

  const addEmojiToInput = (emoji) => {
    setText((prev) => prev + emoji);
  };

  // ✅ NEW: Start voice/video call
  const startCall = (type) => {
    if (!active) return;
    setMenuOpen(false);
    const otherUser = other(active);
    socket.emit("call-request", {
      to: otherUser._id,
      callType: type,
      callerName: user.name,
      callerAvatar: user.avatar,
    });
    setCallState({
      status: "calling",
      type,
      callId: socket.id,
      callerName: user.name,
      callerAvatar: user.avatar,
    });
    toast.success(`Calling ${otherUser.name}...`);
  };

  const other = (c) => c?.participants?.find((p) => p._id !== user._id);
  const isImage = (m) => m.file?.fileType?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)$/i.test(m.file?.url || "");
  const isVideo = (m) => m.file?.fileType?.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(m.file?.url || "");
  const getInitials = (name) => (name || "U").charAt(0).toUpperCase();
  const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDateLabel = (date) => {
    const d = new Date(date), now = new Date(), diff = now - d;
    if (diff < 86400000) return formatTime(date);
    if (diff < 172800000) return "Yesterday";
    if (diff < 604800000) return d.toLocaleDateString("en-IN", { weekday: "short" });
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach((m) => {
      const date = new Date(m.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      let key;
      if (date.toDateString() === today.toDateString()) key = "Today";
      else if (date.toDateString() === yesterday.toDateString()) key = "Yesterday";
      else key = date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });
    return groups;
  };

  const totalUnread = conversations.reduce((s, c) => s + (c.unreadCount || 0), 0);
  const filteredConvs = conversations.filter((c) =>
    other(c)?.name?.toLowerCase().includes(search.toLowerCase())
  );
  const groupedMessages = groupMessagesByDate(messages);

  // ✅ Build otherUser for CallModal (works for both incoming & outgoing)
  const callOtherUser = callState.status !== "idle"
    ? (callState.status === "ringing"
        ? { _id: callState.callerId, name: callState.callerName, avatar: callState.callerAvatar }
        : other(active))
    : null;

  const ChatAvatar = ({ person, size = "w-11 h-11", showOnline = false, isOnline = false, ring = true }) => (
    <div className="relative shrink-0">
      {person?.avatar ? (
        <img src={person.avatar} alt="" className={`${size} rounded-2xl object-cover ${ring ? 'ring-2 ring-white' : ''}`} />
      ) : (
        <div className={`${size} bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-md ${ring ? 'ring-2 ring-white' : ''}`}>
          {getInitials(person?.name)}
        </div>
      )}
      {showOnline && (
        <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-2 py-4 sm:px-4 lg:px-6 h-[calc(100vh-4rem)]">
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-2xl shadow-slate-200/50 h-full flex overflow-hidden">

        {/* ══════════════════════ LEFT SIDEBAR ══════════════════════ */}
        <div className={`${active ? 'hidden lg:flex' : 'flex'} w-full lg:w-96 border-r border-slate-100 flex-col shrink-0 bg-white`}>
          
          <div className="relative p-5 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-pink-400/20 rounded-full blur-2xl" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/20 backdrop-blur-md rounded-2xl">
                    <MessageSquare size={20} />
                  </div>
                  <h2 className="font-black text-xl tracking-tight">Messages</h2>
                </div>
                {totalUnread > 0 && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5">
                    <Zap size={12} className="text-yellow-300" />
                    <span className="text-xs font-bold">{totalUnread > 9 ? "9+" : totalUnread} new</span>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-11 pr-4 py-3 bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl text-sm placeholder:text-white/60 text-white focus:bg-white/30 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 bg-gradient-to-b from-slate-50/50 to-white">
            {filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 px-6 py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mb-4">
                  <MessageSquare size={32} className="text-indigo-400" />
                </div>
                <p className="text-sm font-bold text-slate-700">No conversations yet</p>
                <p className="text-xs text-slate-400 mt-1 text-center">Start chatting from a gig page</p>
              </div>
            ) : (
              filteredConvs.map((c) => {
                const o = other(c);
                const isActive = active?._id === c._id;
                const isOnlineUser = online.includes(o?._id);
                const hasUnread = c.unreadCount > 0;
                return (
                  <button 
                    key={c._id} 
                    onClick={() => openConv(c)}
                    className={`w-full text-left p-3 mb-1.5 flex items-center gap-3 rounded-2xl transition-all duration-200 relative overflow-hidden ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 scale-[1.02]"
                        : hasUnread
                        ? "bg-indigo-50/80 hover:bg-indigo-100 border-l-4 border-indigo-500"
                        : "hover:bg-slate-100/70"
                    }`}
                  >
                    <ChatAvatar person={o} showOnline isOnline={isOnlineUser} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center gap-2">
                        <p className={`font-bold text-sm truncate ${isActive ? "text-white" : hasUnread ? "text-slate-900" : "text-slate-800"}`}>
                          {o?.name || "Unknown"}
                        </p>
                        <span className={`text-[10px] shrink-0 font-semibold ${
                          isActive ? "text-white/80" : hasUnread ? "text-indigo-600" : "text-slate-400"
                        }`}>
                          {c.lastMessageAt ? formatDateLabel(c.lastMessageAt) : ""}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-2 mt-1">
                        <p className={`text-xs truncate ${
                          isActive ? "text-white/90" : hasUnread ? "text-slate-800 font-semibold" : "text-slate-500"
                        }`}>
                          {c.lastMessage || "No messages yet"}
                        </p>
                        {hasUnread && (
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            <span className={`min-w-[22px] h-5 px-1.5 flex items-center justify-center text-[10px] font-black rounded-full ${
                              isActive ? "bg-white text-indigo-600" : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/30"
                            }`}>
                              {c.unreadCount > 9 ? "9+" : c.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ══════════════════════ CHAT WINDOW ══════════════════════ */}
        <div className={`${active ? 'flex' : 'hidden lg:flex'} flex-1 flex-col bg-slate-50/30`}>
          {active ? (
            <>
              {/* ═══ Header ═══ */}
              <div className="px-5 py-3.5 border-b border-slate-100 bg-white shadow-sm flex items-center gap-3 z-10">
                <button 
                  onClick={() => setActive(null)}
                  className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition"
                >
                  <ArrowLeft size={20} className="text-slate-600" />
                </button>
                
                <ChatAvatar person={other(active)} size="w-11 h-11" showOnline isOnline={online.includes(other(active)?._id)} />
                
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 truncate">{other(active)?.name}</p>
                  <p className="text-xs flex items-center gap-1">
                    {typingUser ? (
                      <span className="text-indigo-500 font-semibold italic flex items-center gap-1">
                        <span className="flex gap-0.5">
                          <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </span>
                        typing
                      </span>
                    ) : online.includes(other(active)?._id) ? (
                      <span className="text-emerald-600 font-medium flex items-center gap-1">
                        <Circle size={7} className="fill-emerald-500 text-emerald-500" /> Online now
                      </span>
                    ) : (
                      <span className="text-slate-400">Offline</span>
                    )}
                  </p>
                </div>

                {/* ✅ Action Icons - NOW FUNCTIONAL */}
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => startCall("voice")}
                    className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all" 
                    title="Voice call"
                  >
                    <Phone size={18} />
                  </button>
                  <button 
                    onClick={() => startCall("video")}
                    className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all" 
                    title="Video call"
                  >
                    <Video size={18} />
                  </button>
                  <div className="relative" ref={menuRef}>
                    <button 
                      onClick={() => setMenuOpen(!menuOpen)} 
                      className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-2xl transition-all"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {menuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden">
                        <button 
                          onClick={() => { setMenuOpen(false); setShowChatInfo(true); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                        >
                          <Info size={16} /> Chat Info
                        </button>
                        <button 
                          onClick={() => { setMenuOpen(false); setShowStarred(true); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                        >
                          <Star size={16} /> Starred Messages
                        </button>
                        <div className="border-t border-slate-100" />
                        <button 
                          onClick={() => { setMenuOpen(false); setShowDeleteModal(true); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                        >
                          <Trash2 size={16} /> Delete Chat
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ═══ Messages ═══ */}
              <div 
                className="flex-1 overflow-y-auto px-5 py-6 space-y-4"
                style={{
                  backgroundImage: `radial-gradient(circle, #e2e8f0 1px, transparent 1px)`,
                  backgroundSize: '20px 20px',
                }}
              >
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mb-4 shadow-lg">
                      <MessageSquare size={40} className="text-indigo-400" />
                    </div>
                    <p className="text-lg font-bold text-slate-600">Start the conversation</p>
                    <p className="text-sm text-slate-400 mt-1">Send a message to say hello! 👋</p>
                  </div>
                )}

                {Object.entries(groupedMessages).map(([dateLabel, dateMessages]) => (
                  <div key={dateLabel} className="space-y-4">
                    <div className="flex items-center justify-center my-4">
                      <div className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                          {dateLabel}
                        </span>
                      </div>
                    </div>

                    {dateMessages.map((m, idx) => {
                      const mine = m.sender._id === user._id;
                      const isDeleted = m.deletedForEveryone;
                      const prevMsg = dateMessages[idx - 1];
                      const showAvatar = !prevMsg || prevMsg.sender._id !== m.sender._id;
                      const isStarred = m.starredBy?.includes(user._id);
                      
                      return (
                        <div key={m._id} className={`group flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                          {showAvatar ? (
                            <ChatAvatar person={m.sender} size="w-8 h-8" ring={false} />
                          ) : (
                            <div className="w-8 shrink-0" />
                          )}
                          
                          <div className={`relative max-w-[70%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm relative ${
                              isDeleted 
                                ? "bg-slate-100 text-slate-400 italic border border-slate-200"
                                : mine 
                                ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-sm shadow-indigo-500/20" 
                                : "bg-white text-slate-800 rounded-bl-sm border border-slate-100"
                            }`}>
                              {isDeleted ? (
                                <p className="flex items-center gap-1.5"><Trash2 size={13} /> This message was deleted</p>
                              ) : (
                                <>
                                  {m.text && <p className="whitespace-pre-wrap break-words">{m.text}</p>}
                                  
                                  {m.file?.url && isImage(m) && (
                                    <a href={m.file.url} target="_blank" rel="noreferrer">
                                      <img src={m.file.url} alt="" className="rounded-xl mt-2 max-h-64 w-full object-cover cursor-pointer hover:opacity-90 transition-opacity shadow-md" />
                                    </a>
                                  )}
                                  
                                  {m.file?.url && isVideo(m) && (
                                    <video src={m.file.url} controls className="rounded-xl mt-2 max-h-64 w-full shadow-md" />
                                  )}
                                  
                                  {m.file?.url && !isImage(m) && !isVideo(m) && (
                                    <a href={m.file.url} target="_blank" rel="noreferrer"
                                      className={`flex items-center gap-2.5 mt-2 p-3 rounded-xl transition-all ${mine ? "bg-white/15 hover:bg-white/25" : "bg-slate-50 hover:bg-slate-100 border border-slate-100"}`}>
                                      <div className={`p-2 rounded-lg ${mine ? "bg-white/20" : "bg-indigo-100"}`}>
                                        <FileText size={18} className={mine ? "text-white" : "text-indigo-600"} />
                                      </div>
                                      <div className="min-w-0">
                                        <p className={`text-xs font-bold truncate max-w-[160px] ${mine ? "text-white" : "text-slate-700"}`}>
                                          {m.file.name || "Download file"}
                                        </p>
                                        <p className={`text-[10px] ${mine ? "text-white/70" : "text-slate-500"}`}>
                                          Click to download
                                        </p>
                                      </div>
                                    </a>
                                  )}
                                  
                                  <div className={`flex items-center gap-1 mt-1 ${mine ? "justify-end" : ""}`}>
                                    {/* ✅ Star icon */}
                                    {isStarred && (
                                      <Star size={10} className="fill-amber-400 text-amber-400" />
                                    )}
                                    {m.edited && (
                                      <span className={`text-[9px] italic ${mine ? "text-white/60" : "text-slate-400"}`}>
                                        edited
                                      </span>
                                    )}
                                    <span className={`text-[10px] ${mine ? "text-white/70" : "text-slate-400"}`}>
                                      {formatTime(m.createdAt)}
                                    </span>
                                    {mine && (
                                      <span className={m.readBy?.length > 1 ? "text-emerald-300" : "text-white/60"}>
                                        {m.readBy?.length > 1 ? <CheckCheck size={13} /> : <Check size={13} />}
                                      </span>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>

                            {m.reactions?.length > 0 && (
                              <div className={`flex gap-1 -mt-1.5 ${mine ? "self-end mr-1" : "self-start ml-1"}`}>
                                {Object.entries(
                                  m.reactions.reduce((acc, r) => { 
                                    acc[r.emoji] = (acc[r.emoji] || 0) + 1; 
                                    return acc; 
                                  }, {})
                                ).map(([emoji, count]) => (
                                  <span key={emoji} className="bg-white border border-slate-200 rounded-full px-2 py-0.5 text-xs shadow-md hover:scale-110 transition-transform cursor-pointer">
                                    {emoji} {count > 1 && <span className="font-bold text-slate-600">{count}</span>}
                                  </span>
                                ))}
                              </div>
                            )}

                            {!isDeleted && (
                              <div 
                                data-msg-action 
                                className={`absolute top-1/2 -translate-y-1/2 ${mine ? "-left-20" : "-right-20"} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}
                              >
                                <button 
                                  onClick={() => setEmojiPickerFor(emojiPickerFor === m._id ? null : m._id)} 
                                  className="p-2 bg-white border border-slate-200 rounded-full shadow-md hover:bg-slate-50 text-slate-500 hover:text-indigo-600 transition-all hover:scale-110"
                                >
                                  <Smile size={14} />
                                </button>
                                <button 
                                  onClick={() => setActiveMsgMenu(activeMsgMenu === m._id ? null : m._id)} 
                                  className="p-2 bg-white border border-slate-200 rounded-full shadow-md hover:bg-slate-50 text-slate-500 transition-all hover:scale-110"
                                >
                                  <MoreVertical size={14} />
                                </button>
                              </div>
                            )}

                            {emojiPickerFor === m._id && (
                              <div data-msg-action className={`absolute -top-14 ${mine ? "right-0" : "left-0"} z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl px-2 py-2 flex gap-1`}>
                                {EMOJIS.map((emoji) => (
                                  <button key={emoji} onClick={() => reactToMessage(m._id, emoji)} className="text-xl hover:scale-125 transition-transform p-1">
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}

                            {activeMsgMenu === m._id && (
                              <div data-msg-action className={`absolute top-8 ${mine ? "right-0" : "left-0"} z-50 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden`}>
                                {mine && m.text && (
                                  <button onClick={() => startEdit(m)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-medium transition-colors">
                                    <Pencil size={15} /> Edit Message
                                  </button>
                                )}
                                {/* ✅ Star button */}
                                <button 
                                  onClick={() => toggleStar(m._id)} 
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                                >
                                  <Star size={15} className={isStarred ? "fill-amber-400 text-amber-400" : ""} />
                                  {isStarred ? "Unstar" : "Star message"}
                                </button>
                                <button onClick={() => deleteForMe(m._id)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-medium transition-colors">
                                  <Trash2 size={15} /> Delete for me
                                </button>
                                {mine && (
                                  <button onClick={() => setDeleteMsgTarget(m)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors border-t border-slate-100">
                                    <Trash2 size={15} /> Delete for everyone
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}

                {typingUser && (
                  <div className="flex items-end gap-2">
                    <ChatAvatar person={other(active)} size="w-8 h-8" ring={false} />
                    <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                      <div className="flex gap-1.5 items-center">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* ═══ Input Bar ═══ */}
              <div className="p-4 border-t border-slate-100 bg-white">
                {editingMsg && (
                  <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl px-4 py-2.5 mb-3">
                    <div className="flex items-center gap-2 text-xs text-indigo-700 font-semibold">
                      <Pencil size={13} /> Editing message
                    </div>
                    <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                )}
                
                <form onSubmit={sendText} className="flex items-center gap-2">
                  <input type="file" ref={fileRef} className="hidden" id="chatFile" 
                    accept="image/*,video/*,.pdf,.doc,.docx,.zip,.txt" onChange={sendFile} />
                  
                  {!editingMsg && (
                    <div className="flex gap-1">
                      <label htmlFor="chatFile" 
                        className={`p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all cursor-pointer ${sending ? "opacity-40 pointer-events-none" : ""}`}
                        title="Attach file">
                        <Paperclip size={20} />
                      </label>
                      
                      <div className="relative" data-emoji-input>
                        <button type="button" onClick={() => setShowEmojiInput(!showEmojiInput)}
                          className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all">
                          <Smile size={20} />
                        </button>
                        {showEmojiInput && (
                          <div className="absolute bottom-full left-0 mb-2 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 flex gap-1">
                            {EMOJIS.map((emoji) => (
                              <button key={emoji} type="button" onClick={() => addEmojiToInput(emoji)}
                                className="text-xl hover:scale-125 transition-transform p-1">
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <input type="text" 
                    placeholder={editingMsg ? "Edit your message..." : "Type your message..."} 
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      if (!editingMsg) {
                        socket?.emit("typing", { conversationId: active._id, user: user.name });
                        setTimeout(() => socket?.emit("stop-typing", { conversationId: active._id }), 2000);
                      }
                    }}
                    className="flex-1 px-5 py-3.5 bg-slate-100 border border-transparent rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 focus:bg-white transition-all placeholder:text-slate-400" 
                  />
                  
                  <button type="submit" disabled={!text.trim()} 
                    className="p-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl hover:shadow-lg hover:shadow-indigo-500/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none hover:scale-105 active:scale-95">
                    {editingMsg ? <Check size={20} /> : <Send size={20} />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl">
                <MessageSquare size={56} className="text-indigo-400" />
              </div>
              <p className="text-2xl font-black text-slate-700 mb-2">Welcome to Chat</p>
              <p className="text-sm text-slate-500 max-w-sm text-center">
                Select a conversation from the sidebar to start messaging with clients and freelancers.
              </p>
              <div className="mt-8 flex gap-3">
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
                  <Sparkles size={14} className="text-indigo-500" />
                  <span className="text-xs font-semibold text-slate-600">Real-time messaging</span>
                </div>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
                  <Zap size={14} className="text-emerald-500" />
                  <span className="text-xs font-semibold text-slate-600">Instant delivery</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete CONVERSATION modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !deleting && setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-sm mx-4 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-red-400 via-red-500 to-red-600" />
            <div className="p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-50 to-red-100 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-red-200 shadow-sm">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 text-center">Delete this chat?</h3>
              <p className="text-sm text-slate-500 text-center mt-2 leading-relaxed">
                This conversation will be permanently removed from your messages. The other person will still see it.
              </p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowDeleteModal(false)} disabled={deleting} 
                  className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={deleteConversation} disabled={deleting} 
                  className="flex-1 px-4 py-3 rounded-2xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/30 disabled:opacity-50 flex items-center justify-center gap-2">
                  {deleting ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting...</>
                  ) : (
                    <><Trash2 size={15} /> Delete</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete MESSAGE modal */}
      {deleteMsgTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteMsgTarget(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-50 to-red-100 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-red-200">
              <Trash2 size={30} className="text-red-500" />
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center">Delete for everyone?</h3>
            <p className="text-sm text-slate-500 text-center mt-2">
              This message will be deleted for all participants in the conversation.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteMsgTarget(null)} 
                className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button onClick={() => deleteForEveryone(deleteMsgTarget._id)} 
                className="flex-1 px-4 py-3 rounded-2xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2">
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ NEW: Call Modal */}
      {callState.status !== "idle" && callOtherUser && (
        <CallModal
          callState={callState}
          setCallState={setCallState}
          otherUser={callOtherUser}
          currentUserId={user._id}
        />
      )}

      {/* ✅ NEW: Chat Info Drawer */}
      {showChatInfo && active && (
        <ChatInfoDrawer
          conversation={active}
          currentUser={user}
          onClose={() => setShowChatInfo(false)}
        />
      )}

      {/* ✅ NEW: Starred Messages Modal */}
      {showStarred && active && (
        <StarredMessagesModal
          conversation={active}
          currentUser={user}
          onClose={() => setShowStarred(false)}
        />
      )}
    </div>
  );
}