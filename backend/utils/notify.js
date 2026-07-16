import Notification from "../models/Notification.js";
import { getIO, getUserSocket } from "../socket/socket.js";
import sendEmail from "./sendEmail.js";
import User from "../models/User.js";
import { notificationTemplate } from "./emailTemplates.js";

export const notify = async ({ userId, type, title, body, link, email = false }) => {
  const n = await Notification.create({ user: userId, type, title, body, link });
  try {
    // Real-time socket notification
    const socketId = getUserSocket(userId.toString());
    if (socketId) getIO().to(socketId).emit("notification", n);

    // ✅ Premium HTML email
    if (email) {
      const u = await User.findById(userId);
      if (u) {
        sendEmail({
          to: u.email,
          subject: `${title} | SkillSphere`,
          html: notificationTemplate({ name: u.name, type, title, body, link }),
        }).catch((err) => console.error("📧 Email failed:", err.message));
      }
    }
  } catch {}
  return n;
};