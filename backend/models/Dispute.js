import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
  {
    gig: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Gig", 
      required: true 
    },
    payment: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Payment" 
    },
    raisedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    against: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    reason: { 
      type: String, 
      required: true 
    },
    evidence: [String], // Cloudinary file URLs (evidence upload)
    status: {
      type: String,
      enum: ["open", "under-review", "resolved-refund", "resolved-release", "closed"],
      default: "open",
    },
    adminNote: String, // admin mediation note
    resolvedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
  },
  { timestamps: true }
);

export default mongoose.model("Dispute", disputeSchema);