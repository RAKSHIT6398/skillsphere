import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    gig: { type: mongoose.Schema.Types.ObjectId, ref: "Gig", required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    isVerified: { type: Boolean, default: false }, // true when tied to paid gig
    fraudFlag: { type: Boolean, default: false },
  },
  { timestamps: true }
);
reviewSchema.index({ gig: 1, reviewer: 1 }, { unique: true });
export default mongoose.model("Review", reviewSchema);