import express from "express";
import User from "../models/User.js";
import { protect, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import Freelancer from "../models/Freelancer.js";
import Client from "../models/Client.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
const router = express.Router();

// Get freelancer public profile (+ increments profile views)
// router.get("/:id", async (req, res, next) => {
//   try {
//     const user = await User.findByIdAndUpdate(req.params.id, { $inc: { profileViews: 1 } }, { new: true })
//       .select("-emailVerifyToken -resetPasswordToken");
//     if (!user) return res.status(404).json({ message: "User not found" });
//     res.json(user);
//   } catch (e) { next(e); }
// });

// Update own profile
router.put("/profile", protect, async (req, res, next) => {

  try {

    const allowed = [
      "name",
      "bio",
      "phone",
      "location",
      "skills",
      "portfolio",
      "certifications",
      "experience",
      "hourlyRate"
    ];

    const update = {};

    allowed.forEach((k) => {
      if (req.body[k] !== undefined)
        update[k] = req.body[k];
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: update
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.json(user);

  } catch (e) {
    next(e);
  }

});

// Upload avatar / resume / portfolio image
router.post("/upload", protect, upload.single("file"), (req, res) => {
  res.json({ url: req.file.path });
});
router.put("/avatar", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("File:", req.file.originalname);

    const result = await uploadToCloudinary(req.file, "avatars");

    console.log("Cloudinary Result:", result);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true }
    );

    res.json({ avatar: user.avatar });

  } catch (e) {
    console.error("========== CLOUDINARY ERROR ==========");
    console.error(e);
    console.error("Message:", e.message);
    console.error("HTTP Code:", e.http_code);
    console.error("Error:", e.error);

    return res.status(500).json({
      message: e.message,
      error: e.error,
    });
  }
});
router.put("/resume", protect, authorize("freelancer"), upload.single("file"), async (req, res, next) => {

  try {

    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const result = await uploadToCloudinary(req.file, "resumes");

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        resume: result.secure_url,
      },
      {
        new: true,
      }
    );

    res.json({
      resume: user.resume,
    });

  } catch (e) {
    next(e);
  }

});;

// ---- AVAILABILITY SCHEDULER ----
// router.put("/availability", protect, authorize("freelancer"), async (req, res, next) => {
//   try { req.user.availability = req.body.availability; await req.user.save(); res.json(req.user.availability); }
//   catch (e) { next(e); }
// });

// router.post("/:id/book-slot", protect, async (req, res, next) => {
//   try {
//     const { dateIndex, slotIndex } = req.body;
//     const freelancer = await User.findById(req.params.id);
//     const slot = freelancer?.availability?.[dateIndex]?.slots?.[slotIndex];
//     if (!slot) return res.status(404).json({ message: "Slot not found" });
//     if (slot.booked) return res.status(400).json({ message: "Slot already booked" });

//     slot.booked = true;
//     slot.bookedBy = req.user._id;
//     await freelancer.save();

//     // ✅ Freelancer ko notification + email
//     const day = freelancer.availability[dateIndex];
//     const { notify } = await import("../utils/notify.js");
//     notify({
//       userId: freelancer._id,
//       type: "system",
//       title: "New slot booking! 📅",
//       body: `${req.user.name} booked your slot on ${new Date(day.date).toLocaleDateString()} (${slot.start}–${slot.end})`,
//       link: `/availability`,
//       email: true,
//     });

//     res.json({ message: "Slot booked", availability: freelancer.availability });
//   } catch (e) { next(e); }
// });
// // GET freelancer profile
// router.get("/:id/freelancer-profile", async (req, res, next) => {
//   try {
//     const profile = await Freelancer.findOneAndUpdate(
//       { user: req.params.id },
//       { $inc: { profileViews: 1 } },
//       { new: true, upsert: true }
//     ).populate("user", "name email avatar bio location isEmailVerified");

//     res.json(profile);
//   } catch (e) {
//     next(e);
//   }
// });
router.put("/availability", protect, authorize("freelancer"), async (req, res, next) => {
  try {
    req.user.availability = req.body.availability || [];
    
    // ✅ Mongoose ko batao ki nested array change hua hai
    req.user.markModified("availability");
    
    await req.user.save();
    res.json(req.user.availability);
  } catch (e) {
    next(e);
  }
});

router.post("/:id/book-slot", protect, async (req, res, next) => {
  try {
    const { dateIndex, slotIndex } = req.body;
    const freelancer = await User.findById(req.params.id);

    // ✅ Freelancer exist karta hai ya nahi
    if (!freelancer) {
      return res.status(404).json({ message: "Freelancer not found" });
    }

    // ✅ Apna hi slot book na kar sake
    if (freelancer._id.equals(req.user._id)) {
      return res.status(400).json({ message: "You can't book your own slot" });
    }

    const slot = freelancer?.availability?.[dateIndex]?.slots?.[slotIndex];
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    if (slot.booked) return res.status(400).json({ message: "Slot already booked" });

    slot.booked = true;
    slot.bookedBy = req.user._id;
    await freelancer.save();

    // Freelancer ko notification + email
    const day = freelancer.availability[dateIndex];
    const { notify } = await import("../utils/notify.js");
    notify({
      userId: freelancer._id,
      type: "system",
      title: "New slot booking! 📅",
      body: `${req.user.name} booked your slot on ${new Date(day.date).toLocaleDateString()} (${slot.start}–${slot.end})`,
      link: `/availability`,
      email: true,
    });

    res.json({ message: "Slot booked", availability: freelancer.availability });
  } catch (e) {
    next(e);
  }
});
// GET freelancer profile
router.get("/:id/freelancer-profile", async (req, res, next) => {
  try {
    // ✅ Agar khud apni profile dekh raha hai toh count mat badhao
    // (optional auth - agar token hai toh check karo)
    let incView = { $inc: { profileViews: 1 } };

    // Agar aap chahte ho ki self-view count na ho:
    // req.user tabhi milega jab route pe protect ho, warna skip
    // Simple approach: query param se check karo
    if (req.query.self === "true") {
      incView = {}; // apni profile → count na badhe
    }

    const profile = await Freelancer.findOneAndUpdate(
      { user: req.params.id },
      incView,
      { new: true, upsert: true }
    ).populate("user", "name email avatar bio location isEmailVerified");

    // ✅ Profile null check
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (e) {
    next(e);
  }
});
// CANCEL a booking (booker ya freelancer dono cancel kar sakte hain)
router.post("/:id/cancel-slot", protect, async (req, res, next) => {
  try {
    const { dateIndex, slotIndex } = req.body;
    const freelancer = await User.findById(req.params.id);

    if (!freelancer) {
      return res.status(404).json({ message: "Freelancer not found" });
    }

    const slot = freelancer?.availability?.[dateIndex]?.slots?.[slotIndex];
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    if (!slot.booked) return res.status(400).json({ message: "Slot is not booked" });

    // Sirf booker ya freelancer hi cancel kar sake
    const isBooker = slot.bookedBy?.equals(req.user._id);
    const isOwner = freelancer._id.equals(req.user._id);
    if (!isBooker && !isOwner) {
      return res.status(403).json({ message: "Not authorized to cancel" });
    }

    const previousBooker = slot.bookedBy;
    slot.booked = false;
    slot.bookedBy = null;
    await freelancer.save();

    // Doosri party ko notify karo
    const day = freelancer.availability[dateIndex];
    const notifyUserId = isOwner ? previousBooker : freelancer._id;
    if (notifyUserId) {
      const { notify } = await import("../utils/notify.js");
      notify({
        userId: notifyUserId,
        type: "system",
        title: "Booking cancelled ❌",
        body: `Slot on ${new Date(day.date).toLocaleDateString()} (${slot.start}–${slot.end}) cancelled by ${req.user.name}`,
        link: `/availability`,
        email: true,
      });
    }

    res.json({ message: "Booking cancelled", availability: freelancer.availability });
  } catch (e) {
    next(e);
  }
});
// UPDATE freelancer profile
router.put(
  "/freelancer-profile",
  protect,
  authorize("freelancer"),
  async (req, res, next) => {
    try {
      const allowed = [
        "skills",
        "portfolio",
        "certifications",
        "experience",
        "hourlyRate",
        "milestoneRates",
        "availability",
      ];

      const update = {};

      allowed.forEach((k) => {
        if (req.body[k] !== undefined) update[k] = req.body[k];
      });

      const profile = await Freelancer.findOneAndUpdate(
        { user: req.user._id },
        update,
        { new: true, upsert: true }
      );

      res.json(profile);
    } catch (e) {
      next(e);
    }
  }
);

// GET client profile
router.get("/:id/client-profile", async (req, res, next) => {
  try {
    const profile = await Client.findOne({ user: req.params.id }).populate(
      "user",
      "name email avatar bio location"
    );

    res.json(profile);
  } catch (e) {
    next(e);
  }
});

// Apply for verification badge
router.post(
  "/apply-verification",
  protect,
  authorize("freelancer"),
  upload.array("docs", 3),
  async (req, res, next) => {
    try {
      const profile = await Freelancer.findOneAndUpdate(
        { user: req.user._id },
        {
          verificationStatus: "pending",
          verificationDocs: req.files.map((f) => f.path),
        },
        { new: true, upsert: true }
      );

      res.json(profile);
    } catch (e) {
      next(e);
    }
  }
);

// Get freelancer public profile (+ increments profile views)
// GET /users/:id (existing route)
router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // ✅ Track profile views for freelancers
    if (user.role === "freelancer" && req.user && req.user._id.toString() !== req.params.id) {
      // Only count views from other users (not self-views)
      await Freelancer.findOneAndUpdate(
        { user: req.params.id },
        { 
          $inc: { profileViews: 1 },
          $push: { 
            profileViewHistory: { 
              date: new Date(),
              count: 1 
            } 
          }
        }
      );
    }
    
    res.json(user);
  } catch (e) { next(e); }
});
export default router;