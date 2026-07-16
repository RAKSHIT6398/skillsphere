import express from "express";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { getIO, getUserSocket } from "../socket/socket.js";
import { notify } from "../utils/notify.js";

const router = express.Router();

// ═══════════════════════════════════════
// Get / create conversation
// ═══════════════════════════════════════
router.post("/conversations", protect, async (req, res, next) => {
  try {
    const { participantId, gigId } = req.body;
    let conv = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] },
      gig: gigId || null,
    });
    if (!conv)
      conv = await Conversation.create({
        participants: [req.user._id, participantId],
        gig: gigId || null,
      });
    res.json(await conv.populate("participants", "name avatar"));
  } catch (e) {
    next(e);
  }
});

// ═══════════════════════════════════════
// ✅ FIXED: Only ONE /conversations GET route
// Includes unreadCount + hides deleted-for-me chats
// ═══════════════════════════════════════
router.get("/conversations", protect, async (req, res, next) => {
  try {
    const convs = await Conversation.find({
      participants: req.user._id,
      deletedFor: { $ne: req.user._id },
    })
      .populate("participants", "name avatar")
      .sort("-lastMessageAt");

    // ✅ Real unread count per conversation
    const withUnread = await Promise.all(
      convs.map(async (c) => {
        const unreadCount = await Message.countDocuments({
          conversation: c._id,
          sender: { $ne: req.user._id },
          readBy: { $ne: req.user._id },
          deletedFor: { $ne: req.user._id },
          deletedForEveryone: { $ne: true },
        });
        return { ...c.toObject(), unreadCount };
      })
    );

    res.json(withUnread);
  } catch (e) {
    next(e);
  }
});

// ═══════════════════════════════════════
// Messages in conversation (+ mark read)
// ═══════════════════════════════════════
router.get("/conversations/:id/messages", protect, async (req, res, next) => {
  try {
    await Message.updateMany(
      { conversation: req.params.id, sender: { $ne: req.user._id }, readBy: { $ne: req.user._id } },
      { $push: { readBy: req.user._id } }
    );
    getIO().to(req.params.id).emit("messages-read", {
      conversationId: req.params.id,
      by: req.user._id,
    });

    // hide "delete for me" messages
    res.json(
      await Message.find({
        conversation: req.params.id,
        deletedFor: { $ne: req.user._id },
      })
        .populate("sender", "name avatar")
        .sort("createdAt")
    );
  } catch (e) {
    next(e);
  }
});

// ═══════════════════════════════════════
// Send message (text and/or file)
// ═══════════════════════════════════════
router.post("/conversations/:id/messages", protect, upload.single("file"), async (req, res, next) => {
  try {
    const msg = await Message.create({
      conversation: req.params.id,
      sender: req.user._id,
      text: req.body.text,
      file: req.file
        ? { url: req.file.path, name: req.file.originalname, fileType: req.file.mimetype }
        : undefined,
      readBy: [req.user._id],
    });
    const conv = await Conversation.findByIdAndUpdate(
      req.params.id,
      { lastMessage: req.body.text || "📎 File", lastMessageAt: new Date() },
      { new: true }
    );
    const populated = await msg.populate("sender", "name avatar");
    getIO().to(req.params.id).emit("new-message", populated);

    const other = conv.participants.find((p) => !p.equals(req.user._id));
    if (other && !getUserSocket(other.toString()))
      notify({
        userId: other,
        type: "message",
        title: `New message from ${req.user.name}`,
        body: req.body.text || "Sent a file",
        link: "/chat",
      });
    res.status(201).json(populated);
  } catch (e) {
    next(e);
  }
});

// ═══════════════════════════════════════
// EDIT a message
// ═══════════════════════════════════════
router.put("/messages/:id", protect, async (req, res, next) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: "Message not found" });
    if (!msg.sender.equals(req.user._id))
      return res.status(403).json({ message: "Can only edit your own message" });

    msg.text = req.body.text;
    msg.edited = true;
    await msg.save();

    const populated = await msg.populate("sender", "name avatar");
    getIO().to(msg.conversation.toString()).emit("message-updated", populated);
    res.json(populated);
  } catch (e) {
    next(e);
  }
});

// ═══════════════════════════════════════
// REACT to a message (toggle emoji)
// ═══════════════════════════════════════
router.post("/messages/:id/react", protect, async (req, res, next) => {
  try {
    const { emoji } = req.body;
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    const existing = msg.reactions.find((r) => r.user.equals(req.user._id));
    if (existing && existing.emoji === emoji) {
      msg.reactions = msg.reactions.filter((r) => !r.user.equals(req.user._id));
    } else if (existing) {
      existing.emoji = emoji;
    } else {
      msg.reactions.push({ user: req.user._id, emoji });
    }
    await msg.save();

    const populated = await msg.populate("sender", "name avatar");
    getIO().to(msg.conversation.toString()).emit("message-updated", populated);
    res.json(populated);
  } catch (e) {
    next(e);
  }
});

// ═══════════════════════════════════════
// DELETE for everyone (sirf apna message)
// ═══════════════════════════════════════
router.delete("/messages/:id", protect, async (req, res, next) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: "Message not found" });
    if (!msg.sender.equals(req.user._id))
      return res.status(403).json({ message: "Can only delete your own message" });

    msg.deletedForEveryone = true;
    msg.text = "";
    msg.file = undefined;
    await msg.save();

    getIO().to(msg.conversation.toString()).emit("message-deleted", { messageId: msg._id });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// ═══════════════════════════════════════
// DELETE for me only
// ═══════════════════════════════════════
router.post("/messages/:id/delete-for-me", protect, async (req, res, next) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    if (!msg.deletedFor.includes(req.user._id)) {
      msg.deletedFor.push(req.user._id);
      await msg.save();
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// ═══════════════════════════════════════
// DELETE a conversation (only for current user)
// ═══════════════════════════════════════
router.delete("/conversations/:id", protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findOne({
      _id: id,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    await Conversation.findByIdAndUpdate(id, {
      $addToSet: { deletedFor: req.user._id },
    });

    res.status(200).json({
      message: "Chat deleted for you",
      conversationId: id,
    });
  } catch (e) {
    next(e);
  }
});
// ═══════════════════════════════════════
// ⭐ STAR / UNSTAR a message (toggle)
// ═══════════════════════════════════════
router.post("/messages/:id/star", protect, async (req, res, next) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    const alreadyStarred = msg.starredBy.some(id => id.equals(req.user._id));
    if (alreadyStarred) {
      msg.starredBy = msg.starredBy.filter(id => !id.equals(req.user._id));
    } else {
      msg.starredBy.push(req.user._id);
    }
    await msg.save();

    const populated = await msg.populate("sender", "name avatar");
    getIO().to(msg.conversation.toString()).emit("message-updated", populated);
    res.json({ starred: !alreadyStarred, message: populated });
  } catch (e) { next(e); }
});

// ═══════════════════════════════════════
// ⭐ GET all starred messages in a conversation
// ═══════════════════════════════════════
router.get("/conversations/:id/starred", protect, async (req, res, next) => {
  try {
    const msgs = await Message.find({
      conversation: req.params.id,
      starredBy: req.user._id,
      deletedForEveryone: { $ne: true },
      deletedFor: { $ne: req.user._id },
    })
      .populate("sender", "name avatar")
      .sort("-createdAt");
    res.json(msgs);
  } catch (e) { next(e); }
});

// ═══════════════════════════════════════
// ℹ️ CHAT INFO — stats + shared media + files
// ═══════════════════════════════════════
router.get("/conversations/:id/info", protect, async (req, res, next) => {
  try {
    const conv = await Conversation.findById(req.params.id).populate("participants", "name avatar email role createdAt");
    if (!conv) return res.status(404).json({ message: "Conversation not found" });

    // Total messages count
    const totalMessages = await Message.countDocuments({
      conversation: req.params.id,
      deletedForEveryone: { $ne: true },
    });

    // Messages sent by each user
    const sentCounts = await Message.aggregate([
      { $match: { conversation: conv._id, deletedForEveryone: { $ne: true } } },
      { $group: { _id: "$sender", count: { $sum: 1 } } },
    ]);

    // Shared media (images + videos)
    const sharedMedia = await Message.find({
      conversation: req.params.id,
      "file.fileType": { $regex: /^(image|video)/ },
      deletedForEveryone: { $ne: true },
    })
      .select("file createdAt sender")
      .populate("sender", "name")
      .sort("-createdAt")
      .limit(50);

    // Shared files (documents)
    const sharedFiles = await Message.find({
      conversation: req.params.id,
      "file.fileType": { $regex: /^(application|text)/ },
      deletedForEveryone: { $ne: true },
    })
      .select("file createdAt sender")
      .populate("sender", "name")
      .sort("-createdAt")
      .limit(50);

    // First message date (conversation started)
    const firstMsg = await Message.findOne({ conversation: req.params.id })
      .sort("createdAt").select("createdAt");

    res.json({
      conversation: conv,
      stats: {
        totalMessages,
        sentCounts,
        startedAt: firstMsg?.createdAt || conv.createdAt,
      },
      sharedMedia,
      sharedFiles,
    });
  } catch (e) { next(e); }
});

// ═══════════════════════════════════════
// 🔇 MUTE / UNMUTE conversation
// ═══════════════════════════════════════
router.post("/conversations/:id/mute", protect, async (req, res, next) => {
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ message: "Not found" });

    if (!conv.mutedBy) conv.mutedBy = [];
    const isMuted = conv.mutedBy.some(id => id.equals(req.user._id));
    
    if (isMuted) {
      conv.mutedBy = conv.mutedBy.filter(id => !id.equals(req.user._id));
    } else {
      conv.mutedBy.push(req.user._id);
    }
    await conv.save();
    res.json({ muted: !isMuted });
  } catch (e) { next(e); }
});
// Messages in conversation (+ mark read)
router.get("/conversations/:id/messages", protect, async (req, res, next) => {
  // ... existing code
});

// ✅ YAHAN PASTE KARO ⬇️
router.post("/conversations/:id/read", protect, async (req, res, next) => {
  // ... upar wala code
});

// Send message (text and/or file)
router.post("/conversations/:id/messages", protect, upload.single("file"), async (req, res, next) => {
  // ... existing code
});
export default router;