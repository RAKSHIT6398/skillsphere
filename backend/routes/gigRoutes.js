import express from "express";
import Gig from "../models/Gig.js";
import User from "../models/User.js";
import { protect, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { matchFreelancersForGig, matchGigsForFreelancer, trendingSkills } from "../utils/aiMatch.js";
import { notify } from "../utils/notify.js";

const router = express.Router();

// CREATE GIG
router.post("/", protect, authorize("client"), async (req, res, next) => {
  try {
    const gig = await Gig.create({ ...req.body, client: req.user._id });
    // notify matching freelancers about new gig
    const matches = await matchFreelancersForGig(gig, 5);
    matches.forEach((m) =>
      notify({ userId: m.freelancer._id, type: "new-gig", title: "New gig matches your skills!",
        body: gig.title, link: `/gigs/${gig._id}`, email: true }));
    res.status(201).json(gig);
  } catch (e) { next(e); }
});

// LIST GIGS (marketplace)
router.get("/", async (req, res, next) => {
  try {
    const { status = "open", category, page = 1, limit = 12 } = req.query;
    const filter = { status };
    if (category) filter.category = category;
    const gigs = await Gig.find(filter).populate("client", "name avatar")
      .sort("-createdAt").skip((page - 1) * limit).limit(+limit);
    const total = await Gig.countDocuments(filter);
    res.json({ gigs, total, pages: Math.ceil(total / limit) });
  } catch (e) { next(e); }
});

// MY GIGS
router.get("/mine", protect, async (req, res, next) => {
  try {
    const filter = req.user.role === "client" ? { client: req.user._id } : { hiredFreelancer: req.user._id };
    res.json(await Gig.find(filter).populate("client hiredFreelancer", "name avatar").sort("-createdAt"));
  } catch (e) { next(e); }
});

// AI RECOMMENDATIONS for freelancer
router.get("/recommended", protect, authorize("freelancer"), async (req, res, next) => {
  try { res.json(await matchGigsForFreelancer(req.user)); } catch (e) { next(e); }
});

// TRENDING SKILLS
router.get("/trending-skills", async (req, res, next) => {
  try { res.json(await trendingSkills()); } catch (e) { next(e); }
});

// GIG DETAILS
router.get("/:id", async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id).populate("client hiredFreelancer invitedFreelancers", "name avatar reputationScore isVerifiedBadge");
    if (!gig) return res.status(404).json({ message: "Gig not found" });
    res.json(gig);
  } catch (e) { next(e); }
});

// AI matched freelancers for a gig (client view)
router.get("/:id/matches", protect, async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    res.json(await matchFreelancersForGig(gig));
  } catch (e) { next(e); }
});

// UPDATE / DELETE
router.put("/:id", protect, async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig.client.equals(req.user._id) && req.user.role !== "admin")
      return res.status(403).json({ message: "Not your gig" });
    Object.assign(gig, req.body);
    await gig.save();
    res.json(gig);
  } catch (e) { next(e); }
});
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig.client.equals(req.user._id) && req.user.role !== "admin")
      return res.status(403).json({ message: "Not your gig" });
    await gig.deleteOne();
    res.json({ message: "Deleted" });
  } catch (e) { next(e); }
});

// ATTACHMENTS
router.post("/:id/attachments", protect, upload.array("files", 5), async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    gig.attachments.push(...req.files.map((f) => f.path));
    await gig.save();
    res.json(gig.attachments);
  } catch (e) { next(e); }
});

// INVITE FREELANCER
router.post("/:id/invite/:freelancerId", protect, authorize("client"), async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig.invitedFreelancers.includes(req.params.freelancerId)) {
      gig.invitedFreelancers.push(req.params.freelancerId);
      await gig.save();
      notify({ userId: req.params.freelancerId, type: "new-gig", title: "You were invited to a gig!",
        body: gig.title, link: `/gigs/${gig._id}`, email: true });
    }
    res.json({ message: "Invited" });
  } catch (e) { next(e); }
});

// ---- PROGRESS TRACKER ----
router.post("/:id/tasks", protect, async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    gig.tasks.push({ title: req.body.title });
    await gig.save();
    res.json(gig.tasks);
  } catch (e) { next(e); }
});
router.put("/:id/tasks/:taskId", protect, async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    const task = gig.tasks.id(req.params.taskId);
    if (req.body.done !== undefined) task.done = req.body.done;
    if (req.body.log) task.logs.push({ note: req.body.log });
    await gig.save();
    const pct = gig.tasks.length ? Math.round((gig.tasks.filter((t) => t.done).length / gig.tasks.length) * 100) : 0;
    res.json({ tasks: gig.tasks, completion: pct });
  } catch (e) { next(e); }
});
router.post("/:id/tasks/:taskId/files", protect, upload.array("files", 5), async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    const task = gig.tasks.id(req.params.taskId);
    task.files.push(...req.files.map((f) => f.path));
    await gig.save();
    res.json(task.files);
  } catch (e) { next(e); }
});

// MILESTONE status update
router.put("/:id/milestones/:index", protect, async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    gig.milestones[req.params.index].status = req.body.status;
    await gig.save();
    res.json(gig.milestones);
  } catch (e) { next(e); }
});
// UPDATE / DELETE
router.put("/:id", protect, async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: "Gig not found" }); // ✅ ADD THIS
    if (!gig.client.equals(req.user._id) && req.user.role !== "admin")
      return res.status(403).json({ message: "Not your gig" });
    Object.assign(gig, req.body);
    await gig.save();
    res.json(gig);
  } catch (e) { next(e); }
});

router.delete("/:id", protect, async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: "Gig not found" }); // ✅ ADD THIS
    if (!gig.client.equals(req.user._id) && req.user.role !== "admin")
      return res.status(403).json({ message: "Not your gig" });
    await gig.deleteOne();
    res.json({ message: "Deleted" });
  } catch (e) { next(e); }
});
export default router;