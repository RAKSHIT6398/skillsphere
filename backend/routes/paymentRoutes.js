import dotenv from "dotenv";
dotenv.config();
import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import Payment from "../models/Payment.js";
import Gig from "../models/Gig.js";
import { protect, authorize } from "../middleware/auth.js";
import { notify } from "../utils/notify.js";

const router = express.Router();
const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

// CREATE ORDER (escrow for a milestone)
router.post("/create-order", protect, authorize("client"), async (req, res, next) => {
  try {
    const { gigId, milestoneIndex } = req.body;
    const gig = await Gig.findById(gigId);
    const milestone = gig.milestones[milestoneIndex];
    if (!milestone) return res.status(404).json({ message: "Milestone not found" });
    const platformFee = Math.round(milestone.amount * 0.05);
    const order = await razorpay.orders.create({ amount: milestone.amount * 100, currency: "INR", receipt: `gig_${gigId}_${milestoneIndex}` });
    const payment = await Payment.create({
      gig: gigId, client: req.user._id, freelancer: gig.hiredFreelancer,
      milestoneIndex, amount: milestone.amount, platformFee, razorpayOrderId: order.id,
    });
    res.json({ order, paymentId: payment._id, key: process.env.RAZORPAY_KEY_ID });
  } catch (e) { next(e); }
});

// VERIFY PAYMENT → money moves to ESCROW
router.post("/verify", protect, async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    if (expected !== razorpay_signature) return res.status(400).json({ message: "Payment verification failed" });
    const payment = await Payment.findByIdAndUpdate(paymentId,
      { status: "escrowed", razorpayPaymentId: razorpay_payment_id }, { new: true });
    notify({ userId: payment.freelancer, type: "payment", title: "Payment escrowed 💰",
      body: `₹${payment.amount} secured in escrow`, link: "/payments", email: true });
    res.json(payment);
  } catch (e) { next(e); }
});

// RELEASE (client approves milestone → automatic freelancer payout)
router.put("/:id/release", protect, authorize("client"), async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment.client.equals(req.user._id)) return res.status(403).json({ message: "Not authorized" });
    if (payment.status !== "escrowed") return res.status(400).json({ message: "Not in escrow" });
    payment.status = "released";
    await payment.save();
    const gig = await Gig.findById(payment.gig);
    if (gig.milestones[payment.milestoneIndex]) {
      gig.milestones[payment.milestoneIndex].status = "paid";
      if (gig.milestones.every((m) => m.status === "paid")) gig.status = "completed";
      await gig.save();
    }
    notify({ userId: payment.freelancer, type: "payment", title: "Payment released! 🎉",
      body: `₹${payment.amount - payment.platformFee} paid to you`, link: "/payments", email: true });
    res.json(payment);
  } catch (e) { next(e); }
});

// REFUND
router.put("/:id/refund", protect, async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (req.user.role !== "admin" && !payment.client.equals(req.user._id))
      return res.status(403).json({ message: "Not authorized" });
    if (payment.razorpayPaymentId)
      await razorpay.payments.refund(payment.razorpayPaymentId, { amount: payment.amount * 100 }).catch(() => {});
    payment.status = "refunded";
    await payment.save();
    notify({ userId: payment.client, type: "payment", title: "Refund processed", body: `₹${payment.amount} refunded`, email: true });
    res.json(payment);
  } catch (e) { next(e); }
});

// TRANSACTION HISTORY
router.get("/history", protect, async (req, res, next) => {
  try {
    const filter = req.user.role === "client" ? { client: req.user._id } : { freelancer: req.user._id };
    res.json(await Payment.find(filter).populate("gig", "title").populate("client freelancer", "name").sort("-createdAt"));
  } catch (e) { next(e); }
});

export default router;