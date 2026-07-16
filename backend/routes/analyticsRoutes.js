import express from "express";
import Proposal from "../models/Proposal.js";
import Payment from "../models/Payment.js";
import Review from "../models/Review.js";
import Freelancer from "../models/Freelancer.js";
import { protect, authorize } from "../middleware/auth.js";
import mongoose from "mongoose";

const router = express.Router();

router.get("/freelancer", protect, authorize("freelancer"), async (req, res, next) => {
  try {
    const uid = req.user._id;

    // ==================== DATE RANGES ====================
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // ==================== PARALLEL QUERIES ====================
    const [
      applications, 
      earnings, 
      monthly, 
      feedback,
      thisMonthEarnings,
      lastMonthEarnings,
      thisMonthJobs,
      lastMonthJobs,
      freelancer
    ] = await Promise.all([
      // 1. Applications by status
      Proposal.aggregate([
        { $match: { freelancer: uid } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),

      // 2. Total earnings
      Payment.aggregate([
        { $match: { freelancer: uid, status: "released" } },
        { $group: { _id: null, total: { $sum: "$amount" }, fees: { $sum: "$platformFee" }, count: { $sum: 1 } } }
      ]),

      // 3. Monthly revenue
      Payment.aggregate([
        { $match: { freelancer: uid, status: "released" } },
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, total: { $sum: "$amount" } } },
        { $sort: { _id: 1 } },
      ]),

      // 4. Feedback distribution
      Review.aggregate([
        { $match: { reviewee: uid, fraudFlag: false } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
        { $sort: { _id: -1 } }
      ]),

      // 5. ✅ THIS MONTH earnings
      Payment.aggregate([
        { $match: { freelancer: uid, status: "released", createdAt: { $gte: startOfThisMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
      ]),

      // 6. ✅ LAST MONTH earnings
      Payment.aggregate([
        { $match: { freelancer: uid, status: "released", createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
      ]),

      // 7. ✅ THIS MONTH jobs count
      Payment.countDocuments({ 
        freelancer: uid, 
        status: "released",
        createdAt: { $gte: startOfThisMonth }
      }),

      // 8. ✅ LAST MONTH jobs count
      Payment.countDocuments({ 
        freelancer: uid, 
        status: "released",
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
      }),

      // 9. ✅ Freelancer profile (for view history)
      Freelancer.findOne({ user: uid })
    ]);

    // ==================== CALCULATE PROFILE VIEWS TREND ====================
    const currentWeekViews = freelancer?.profileViewHistory?.filter(
      v => v.date >= oneWeekAgo
    ).length || 0;

    const previousWeekViews = freelancer?.profileViewHistory?.filter(
      v => v.date >= twoWeeksAgo && v.date < oneWeekAgo
    ).length || 0;

    // ==================== RESPONSE ====================
    res.json({
      // Existing fields
      profileViews: req.user.profileViews || freelancer?.profileViews || 0,
      reputationScore: req.user.reputationScore || freelancer?.reputationScore || 0,
      applications,
      earnings: earnings[0] || { total: 0, fees: 0, count: 0 },
      monthlyRevenue: monthly,
      feedbackDistribution: feedback,

      // ✅ NEW: Real trend data
      trends: {
        // Earnings trend
        thisMonthEarnings: thisMonthEarnings[0]?.total || 0,
        lastMonthEarnings: lastMonthEarnings[0]?.total || 0,
        
        // Jobs trend
        thisMonthJobs,
        lastMonthJobs,

        // Profile views trend
        currentWeekViews,
        previousWeekViews,
      }
    });
  } catch (e) { next(e); }
});

export default router;