import { Server } from "socket.io";

let io;

// userId -> Set(socketId)  [multi-tab safe]
const onlineUsers = new Map();

const toId = (v) => (v == null ? "" : String(v));

const addUser = (userId, socketId) => {
  const id = toId(userId);
  if (!id) return;

  if (!onlineUsers.has(id)) onlineUsers.set(id, new Set());
  onlineUsers.get(id).add(socketId);
};

const removeUser = (userId, socketId) => {
  const id = toId(userId);
  const set = onlineUsers.get(id);
  if (!set) return;

  set.delete(socketId);
  if (set.size === 0) onlineUsers.delete(id);
};

const getSockets = (userId) => {
  const set = onlineUsers.get(toId(userId));
  return set ? [...set] : [];
};

const emitToUser = (userId, event, payload) => {
  const sockets = getSockets(userId);
  if (!sockets.length) {
    console.warn(`⚠️ emit failed: ${event} → user ${userId} offline`);
    return false;
  }

  sockets.forEach((sid) => io.to(sid).emit(event, payload));
  return true;
};

const getOnlineUserIds = () => [...onlineUsers.keys()];

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
    // call ke dauran disconnect kam ho
    pingTimeout: 20000,
    pingInterval: 10000,
    maxHttpBufferSize: 1e6,
  });

  io.on("connection", (socket) => {
    const userId = toId(socket.handshake.query.userId);
    socket.userId = userId;

    console.log("🔌 Connected:", socket.id, "User:", userId || "none");

    if (userId) {
      addUser(userId, socket.id);
      console.log("✅ Online:", getOnlineUserIds());
    }

    // online list
    socket.emit("online-users", getOnlineUserIds());
    io.emit("online-users", getOnlineUserIds());

    socket.on("get-online-users", () => {
      socket.emit("online-users", getOnlineUserIds());
    });

    // ==========================
    // CHAT
    // ==========================
    socket.on("join-conversation", (conversationId) => {
      if (conversationId) socket.join(String(conversationId));
    });

    socket.on("leave-conversation", (conversationId) => {
      if (conversationId) socket.leave(String(conversationId));
    });

    socket.on("typing", ({ conversationId, user }) => {
      if (!conversationId) return;
      socket.to(String(conversationId)).emit("typing", {
        conversationId: String(conversationId),
        user,
      });
    });

    socket.on("stop-typing", ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(String(conversationId)).emit("stop-typing", {
        conversationId: String(conversationId),
      });
    });

    // ==========================
    // CALL SIGNALING
    // ==========================
    socket.on("call-request", ({ to, callType, callerName, callerAvatar, callId }) => {
      const target = toId(to);
      if (!userId || !target) return;

      const ok = emitToUser(target, "incoming-call", {
        from: userId,
        callerName,
        callerAvatar,
        callType,
        callId: callId || `${userId}_${Date.now()}`,
      });

      if (!ok) {
        socket.emit("call-rejected", {
          by: target,
          reason: "offline",
        });
      }
    });

    socket.on("call-accepted", ({ to, callId }) => {
      const target = toId(to);
      if (!userId || !target) return;

      emitToUser(target, "call-accepted", {
        by: userId,
        callId,
      });
    });

    socket.on("call-rejected", ({ to, callId, reason }) => {
      const target = toId(to);
      if (!userId || !target) return;

      emitToUser(target, "call-rejected", {
        by: userId,
        callId,
        reason: reason || "rejected",
      });
    });

    socket.on("call-ended", ({ to, callId }) => {
      const target = toId(to);
      if (!userId || !target) return;

      emitToUser(target, "call-ended", {
        by: userId,
        callId,
      });
    });

    // ==========================
    // WebRTC
    // ==========================
    socket.on("offer", ({ to, offer }) => {
      const target = toId(to);
      if (!userId || !target || !offer) return;

      console.log(`📨 offer ${userId} → ${target}`);
      const ok = emitToUser(target, "offer", { from: userId, offer });
      if (!ok) socket.emit("call-failed", { reason: "peer-offline" });
    });

    socket.on("answer", ({ to, answer }) => {
      const target = toId(to);
      if (!userId || !target || !answer) return;

      console.log(`📨 answer ${userId} → ${target}`);
      const ok = emitToUser(target, "answer", { from: userId, answer });
      if (!ok) socket.emit("call-failed", { reason: "peer-offline" });
    });

    socket.on("ice-candidate", ({ to, candidate }) => {
      const target = toId(to);
      if (!userId || !target || !candidate) return;

      // quiet but useful
      // console.log(`🧊 ice ${userId} → ${target}`);
      emitToUser(target, "ice-candidate", { from: userId, candidate });
    });

    // ==========================
    // Disconnect
    // ==========================
    socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected:", userId, reason);

      if (userId) {
        removeUser(userId, socket.id);

        // agar user fully offline ho gaya to dusre side ko end signal
        if (!onlineUsers.has(userId)) {
          // optional: active call cleanup frontend pe bhi handle karo
        }
      }

      io.emit("online-users", getOnlineUserIds());
    });
  });

  return io;
};

export const getIO = () => io;

export const getUserSocket = (userId) => {
  const sockets = getSockets(userId);
  return sockets[0] || null;
};

export const getUserSockets = (userId) => getSockets(userId);