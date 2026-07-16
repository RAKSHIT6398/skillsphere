import express from "express";
import User from "../models/User.js";
import Gig from "../models/Gig.js";
import Payment from "../models/Payment.js";
import Review from "../models/Review.js";
import AdminLog from "../models/AdminLog.js";
import { protect, authorize } from "../middleware/auth.js";
import Freelancer from "../models/Freelancer.js";
const router = express.Router();
router.use(protect, authorize("admin"));

const log = (admin, action, type, id) => AdminLog.create({ admin, action, targetType: type, targetId: id });

// USERS
router.get("/users", async (req, res, next) => {
  try {
    const { role, q } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (q) filter.$or = [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }];
    res.json(await User.find(filter).sort("-createdAt").limit(100));
  } catch (e) { next(e); }
});
router.put("/users/:id/suspend", async (req, res, next) => {
  try {
    const u = await User.findById(req.params.id);
    u.isSuspended = !u.isSuspended;
    await u.save();
    await log(req.user._id, u.isSuspended ? "Suspended user" : "Unsuspended user", "User", u._id);
    res.json(u);
  } catch (e) { next(e); }
});
router.put("/users/:id/verify-badge", async (req, res, next) => {
  try {
    const u = await User.findByIdAndUpdate(
      req.params.id,
      { isVerifiedBadge: true },
      { new: true }
    );

    await Freelancer.findOneAndUpdate(
      { user: req.params.id },
      {
        isVerifiedBadge: true,
        verificationStatus: "approved",
      },
      {
        new: true,
        upsert: true,
      }
    );

    await log(
      req.user._id,
      "Verified freelancer badge",
      "User",
      u._id
    );

    res.json(u);
  } catch (e) {
    next(e);
  }
});

// GIG APPROVAL
router.get("/gigs/pending", async (req, res, next) => {
  try { res.json(await Gig.find({ status: "pending-approval" }).populate("client", "name email")); }
  catch (e) { next(e); }
});
router.put("/gigs/:id/approve", async (req, res, next) => {
  try {
    const g = await Gig.findByIdAndUpdate(req.params.id, { status: "open" }, { new: true });
    await log(req.user._id, "Approved gig", "Gig", g._id);
    res.json(g);
  } catch (e) { next(e); }
});

// PAYMENT MONITORING
router.get("/payments", async (req, res, next) => {
  try { res.json(await Payment.find().populate("gig", "title").populate("client freelancer", "name email").sort("-createdAt").limit(100)); }
  catch (e) { next(e); }
});

// FRAUD DETECTION (flagged reviews)
router.get("/fraud-reviews", async (req, res, next) => {
  try { res.json(await Review.find({ fraudFlag: true }).populate("reviewer reviewee", "name email")); }
  catch (e) { next(e); }
});
router.put("/fraud-reviews/:id/clear", async (req, res, next) => {
  try { res.json(await Review.findByIdAndUpdate(req.params.id, { fraudFlag: false }, { new: true })); }
  catch (e) { next(e); }
});

// ANALYTICS
router.get("/analytics", async (req, res, next) => {
  try {
    const [released, activeFreelancers, topCategories, gigStats, monthly] = await Promise.all([
      Payment.aggregate([{ $match: { status: "released" } },
        { $group: { _id: null, revenue: { $sum: "$platformFee" }, volume: { $sum: "$amount" } } }]),
      User.countDocuments({ role: "freelancer", isSuspended: false }),
      Gig.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]),
      Gig.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Payment.aggregate([
        { $match: { status: "released" } },
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, total: { $sum: "$amount" } } },
        { $sort: { _id: 1 } },
      ]),
    ]);
    const completed = gigStats.find((s) => s._id === "completed")?.count || 0;
    const totalGigs = gigStats.reduce((s, g) => s + g.count, 0);
    res.json({
      platformRevenue: released[0]?.revenue || 0,
      paymentVolume: released[0]?.volume || 0,
      activeFreelancers,
      topCategories,
      jobSuccessRate: totalGigs ? +((completed / totalGigs) * 100).toFixed(1) : 0,
      gigStats, monthlyRevenue: monthly,
      totalUsers: await User.countDocuments(),
    });
  } catch (e) { next(e); }
});

router.get("/logs", async (req, res, next) => {
  try { res.json(await AdminLog.find().populate("admin", "name").sort("-createdAt").limit(100)); }
  catch (e) { next(e); }
});

export default router;