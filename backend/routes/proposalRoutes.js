import express from "express";
import Proposal from "../models/Proposal.js";
import Gig from "../models/Gig.js";
import { protect, authorize } from "../middleware/auth.js";
import { notify } from "../utils/notify.js";

const router = express.Router();

// SUBMIT PROPOSAL
router.post("/", protect, authorize("freelancer"), async (req, res, next) => {
  try {
    const { gigId, coverLetter, bidAmount, estimatedDays } = req.body;
    const gig = await Gig.findById(gigId);
    if (!gig || gig.status !== "open") return res.status(400).json({ message: "Gig not open" });
    const proposal = await Proposal.create({ gig: gigId, freelancer: req.user._id, coverLetter, bidAmount, estimatedDays });
    notify({ userId: gig.client, type: "proposal-received", title: "New proposal received",
      body: `${req.user.name} bid ₹${bidAmount} on "${gig.title}"`, link: `/gigs/${gigId}`, email: true });
    res.status(201).json(proposal);
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ message: "Already applied to this gig" });
    next(e);
  }
});

// PROPOSALS FOR A GIG (client)
router.get("/gig/:gigId", protect, async (req, res, next) => {
  try {
    res.json(await Proposal.find({ gig: req.params.gigId })
      .populate("freelancer", "name avatar skills reputationScore hourlyRate isVerifiedBadge"));
  } catch (e) { next(e); }
});

// MY PROPOSALS (freelancer — application status)
router.get("/mine", protect, authorize("freelancer"), async (req, res, next) => {
  try {
    res.json(await Proposal.find({ freelancer: req.user._id }).populate("gig", "title status budgetMin budgetMax").sort("-createdAt"));
  } catch (e) { next(e); }
});

// ACCEPT
router.put("/:id/accept", protect, authorize("client"), async (req, res, next) => {
  try {
    const p = await Proposal.findById(req.params.id).populate("gig");
    if (!p.gig.client.equals(req.user._id)) return res.status(403).json({ message: "Not your gig" });
    p.status = "accepted";
    await p.save();
    await Gig.findByIdAndUpdate(p.gig._id, { hiredFreelancer: p.freelancer, status: "in-progress" });
    await Proposal.updateMany({ gig: p.gig._id, _id: { $ne: p._id } }, { status: "rejected" });
    notify({ userId: p.freelancer, type: "proposal-accepted", title: "Proposal accepted! 🎉",
      body: `Your proposal for "${p.gig.title}" was accepted`, link: `/gigs/${p.gig._id}`, email: true });
    res.json(p);
  } catch (e) { next(e); }
});

// REJECT
router.put("/:id/reject", protect, authorize("client"), async (req, res, next) => {
  try {
    const p = await Proposal.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true });
    res.json(p);
  } catch (e) { next(e); }
});

// NEGOTIATE
router.put("/:id/negotiate", protect, async (req, res, next) => {
  try {
    const p = await Proposal.findById(req.params.id);
    p.status = "negotiating";
    p.negotiation.push({ by: req.user.role, amount: req.body.amount, message: req.body.message });
    if (req.user.role === "freelancer" && req.body.amount) p.bidAmount = req.body.amount;
    await p.save();
    res.json(p);
  } catch (e) { next(e); }
});

export default router;