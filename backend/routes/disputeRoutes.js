import express from "express";
import Dispute from "../models/Dispute.js";
import Payment from "../models/Payment.js";
import { protect, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { notify } from "../utils/notify.js";
import AdminLog from "../models/AdminLog.js";

const router = express.Router();

router.post("/", protect, upload.array("evidence", 5), async (req, res, next) => {
  try {
    const dispute = await Dispute.create({
      gig: req.body.gigId, payment: req.body.paymentId || undefined,
      raisedBy: req.user._id, against: req.body.againstId,
      reason: req.body.reason, evidence: (req.files || []).map((f) => f.path),
    });
    notify({ userId: req.body.againstId, type: "dispute", title: "Dispute raised against you",
      body: req.body.reason, link: "/disputes", email: true });
    res.status(201).json(dispute);
  } catch (e) { next(e); }
});

router.get("/mine", protect, async (req, res, next) => {
  try {
    res.json(await Dispute.find({ $or: [{ raisedBy: req.user._id }, { against: req.user._id }] })
      .populate("gig", "title").populate("raisedBy against", "name").sort("-createdAt"));
  } catch (e) { next(e); }
});

// Add evidence later
router.put("/:id/evidence", protect, upload.array("evidence", 5), async (req, res, next) => {
  try {
    const d = await Dispute.findById(req.params.id);
    d.evidence.push(...req.files.map((f) => f.path));
    await d.save();
    res.json(d);
  } catch (e) { next(e); }
});

// ADMIN: list + resolve
router.get("/", protect, authorize("admin"), async (req, res, next) => {
  try {
    res.json(await Dispute.find().populate("gig", "title").populate("raisedBy against", "name email").sort("-createdAt"));
  } catch (e) { next(e); }
});

router.put("/:id/resolve", protect, authorize("admin"), async (req, res, next) => {
  try {
    const { resolution, adminNote } = req.body; // "resolved-refund" | "resolved-release" | "closed"
    const d = await Dispute.findByIdAndUpdate(req.params.id,
      { status: resolution, adminNote, resolvedBy: req.user._id }, { new: true });
    if (d.payment) {
      if (resolution === "resolved-refund") await Payment.findByIdAndUpdate(d.payment, { status: "refunded" });
      if (resolution === "resolved-release") await Payment.findByIdAndUpdate(d.payment, { status: "released" });
    }
    await AdminLog.create({ admin: req.user._id, action: `Resolved dispute: ${resolution}`, targetType: "Dispute", targetId: d._id });
    [d.raisedBy, d.against].forEach((u) =>
      notify({ userId: u, type: "dispute", title: "Dispute resolved", body: adminNote || resolution, email: true }));
    res.json(d);
  } catch (e) { next(e); }
});

export default router;