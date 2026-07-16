import { io } from "socket.io-client";

let socket = null;

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const toId = (v) => (v == null ? "" : String(v));

export const connectSocket = (userId) => {
  const cleanUserId = toId(userId);
  const token = localStorage.getItem("token");

  if (!token || !cleanUserId) {
    console.warn("⚠️ No token or userId — socket not created");
    return null;
  }

  // Already connected with same user
  if (socket?.connected) {
    const currentUserId = toId(socket.handshake?.query?.userId);
    if (currentUserId === cleanUserId) {
      console.log("🔌 Socket already connected");
      return socket;
    }

    // Different user logged in → recreate
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  // If socket exists but not connected, clean it
  if (socket && !socket.connected) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    // 🔥 CRITICAL for call routing
    query: {
      userId: cleanUserId,
      token,
    },

    // auth bhi bhej do (future-proof)
    auth: {
      userId: cleanUserId,
      token,
    },

    // websocket preferred for WebRTC signaling speed
    transports: ["websocket", "polling"],

    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id, "user:", cleanUserId);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.warn("⚠️ Connect error:", err.message);
  });

  // reconnect pe ensure same identity
  socket.io.on("reconnect_attempt", () => {
    socket.io.opts.query = {
      userId: cleanUserId,
      token: localStorage.getItem("token") || token,
    };
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (!socket) return;

  console.log("🔌 Disconnecting socket...");
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
};

// helper for call events
export const emitToPeer = (event, payload = {}) => {
  if (!socket) {
    console.warn(`⚠️ emit failed (${event}): socket missing`);
    return false;
  }

  const nextPayload = {
    ...payload,
    to: payload?.to != null ? String(payload.to) : payload?.to,
  };

  socket.emit(event, nextPayload);
  return true;
};