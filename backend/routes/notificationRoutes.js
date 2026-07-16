// import express from "express";
// import Notification from "../models/Notification.js";
// import { protect } from "../middleware/auth.js";

// const router = express.Router();

// router.get("/", protect, async (req, res, next) => {
//   try { res.json(await Notification.find({ user: req.user._id }).sort("-createdAt").limit(50)); }
//   catch (e) { next(e); }
// });
// router.put("/read-all", protect, async (req, res, next) => {
//   try { await Notification.updateMany({ user: req.user._id }, { isRead: true }); res.json({ ok: true }); }
//   catch (e) { next(e); }
// });
// router.put("/:id/read", protect, async (req, res, next) => {
//   try { res.json(await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true })); }
//   catch (e) { next(e); }
// });

// export default router;


import express from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Get all notifications (last 50)
router.get("/", protect, async (req, res, next) => {
  try {
    res.json(
      await Notification.find({ user: req.user._id })
        .sort("-createdAt")
        .limit(50)
    );
  } catch (e) {
    next(e);
  }
});

// Mark all as read
router.put("/read-all", protect, async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id }, { isRead: true });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// Mark single as read
router.put("/:id/read", protect, async (req, res, next) => {
  try {
    res.json(
      await Notification.findByIdAndUpdate(
        req.params.id,
        { isRead: true },
        { new: true }
      )
    );
  } catch (e) {
    next(e);
  }
});

// ✅ Clear ALL notifications of logged-in user
// IMPORTANT: yeh "/:id" se PEHLE hona chahiye
router.delete("/clear", protect, async (req, res, next) => {
  try {
    await Notification.deleteMany({ user: req.user._id });
    res.json({ ok: true, message: "All notifications cleared" });
  } catch (e) {
    next(e);
  }
});

// ✅ Delete a SINGLE notification (only own)
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id, // sirf apni notification delete kar sake
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ ok: true, message: "Notification deleted" });
  } catch (e) {
    next(e);
  }
});

export default router;