import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema(
  {
    gig: { type: mongoose.Schema.Types.ObjectId, ref: "Gig", required: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    coverLetter: { type: String, required: true },
    bidAmount: { type: Number, required: true },
    estimatedDays: { type: Number, required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected", "negotiating"], default: "pending" },
    negotiation: [{ by: { type: String, enum: ["client", "freelancer"] }, amount: Number, message: String, at: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
);
proposalSchema.index({ gig: 1, freelancer: 1 }, { unique: true });
export default mongoose.model("Proposal", proposalSchema);