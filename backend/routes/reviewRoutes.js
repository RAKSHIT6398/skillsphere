import express from "express";
import Review from "../models/Review.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { notify } from "../utils/notify.js";

const router = express.Router();

// Weighted reputation: verified reviews ×1.5, recent ×1.2
const recalcReputation = async (userId) => {
  const reviews = await Review.find({ reviewee: userId, fraudFlag: false });
  if (!reviews.length) return 0;
  let wSum = 0, wTotal = 0;
  const now = Date.now();
  reviews.forEach((r) => {
    let w = 1;
    if (r.isVerified) w *= 1.5;
    if (now - r.createdAt < 90 * 864e5) w *= 1.2;
    wSum += r.rating * w;
    wTotal += w;
  });
  const score = +(wSum / wTotal).toFixed(2);
  await User.findByIdAndUpdate(userId, { reputationScore: score });
  return score;
};

// CREATE REVIEW
router.post("/", protect, async (req, res, next) => {
  try {
    const { gigId, revieweeId, rating, comment } = req.body;
    // Verified = tied to a released payment
    const paid = await Payment.findOne({ gig: gigId, status: "released" });
    // Fraud heuristics: burst reviews or 5-star flood between same pair
    const recentBetween = await Review.countDocuments({
      reviewer: req.user._id, reviewee: revieweeId, createdAt: { $gte: new Date(Date.now() - 7 * 864e5) },
    });
    const fraudFlag = recentBetween >= 2 || (!paid && rating === 5 && (!comment || comment.length < 10));
    const review = await Review.create({
      gig: gigId, reviewer: req.user._id, reviewee: revieweeId,
      rating, comment, isVerified: !!paid, fraudFlag,
    });
    const score = await recalcReputation(revieweeId);
    notify({ userId: revieweeId, type: "review", title: "New review received ⭐",
      body: `${req.user.name} rated you ${rating}/5`, link: `/profile/${revieweeId}` });
    res.status(201).json({ review, reputationScore: score });
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ message: "Already reviewed this gig" });
    next(e);
  }
});

// REVIEWS OF USER
router.get("/user/:id", async (req, res, next) => {
  try {
    res.json(await Review.find({ reviewee: req.params.id, fraudFlag: false })
      .populate("reviewer", "name avatar").sort("-createdAt"));
  } catch (e) { next(e); }
});

// REVIEW ANALYTICS
router.get("/analytics/:id", async (req, res, next) => {
  try {
    const agg = await Review.aggregate([
      { $match: { reviewee: new (await import("mongoose")).default.Types.ObjectId(req.params.id), fraudFlag: false } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]);
    res.json(agg);
  } catch (e) { next(e); }
});

export default router;