import express from "express";
import Gig from "../models/Gig.js";
import User from "../models/User.js";

const router = express.Router();

// ADVANCED GIG SEARCH: text, skill, price, location radius, experience
router.get("/gigs", async (req, res, next) => {
  try {
    const { q, skill, minPrice, maxPrice, city, lng, lat, radiusKm, experience, page = 1, limit = 12 } = req.query;
    const filter = { status: "open" };
    if (q) filter.$text = { $search: q };
    if (skill) filter.skillsRequired = { $regex: skill, $options: "i" };
    if (minPrice || maxPrice) {
      filter.budgetMax = {};
      if (minPrice) filter.budgetMax.$gte = +minPrice;
      if (maxPrice) filter.budgetMin = { $lte: +maxPrice };
    }
    if (city) filter["location.city"] = { $regex: city, $options: "i" };
    if (experience) filter.experienceLevel = experience;
    if (lng && lat && radiusKm) {
      filter["location.coordinates"] = {
        $geoWithin: { $centerSphere: [[+lng, +lat], +radiusKm / 6378.1] },
      };
    }
    const gigs = await Gig.find(filter).populate("client", "name avatar")
      .sort("-createdAt").skip((page - 1) * limit).limit(+limit);
    res.json({ gigs, total: await Gig.countDocuments(filter) });
  } catch (e) { next(e); }
});

// FREELANCER SEARCH: skill, rating, rate, location
router.get("/freelancers", async (req, res, next) => {
  try {
    const { skill, minRating, maxRate, city, lng, lat, radiusKm } = req.query;
    const filter = { role: "freelancer", isSuspended: false };
    if (skill) filter["skills.name"] = { $regex: skill, $options: "i" };
    if (minRating) filter.reputationScore = { $gte: +minRating };
    if (maxRate) filter.hourlyRate = { $lte: +maxRate };
    if (city) filter["location.city"] = { $regex: city, $options: "i" };
    if (lng && lat && radiusKm)
      filter["location.coordinates"] = { $geoWithin: { $centerSphere: [[+lng, +lat], +radiusKm / 6378.1] } };
    res.json(await User.find(filter)
      .select("name avatar skills reputationScore hourlyRate location isVerifiedBadge bio")
      .sort("-reputationScore").limit(30));
  } catch (e) { next(e); }
});

export default router;