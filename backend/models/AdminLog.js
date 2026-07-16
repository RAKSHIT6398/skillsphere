import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema(
  {
    admin: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    action: String,      // e.g. "Suspended user", "Approved gig", "Resolved dispute"
    targetType: String,  // e.g. "User", "Gig", "Dispute", "Payment"
    targetId: String,    // ID of the affected document
  },
  { timestamps: true }
);

export default mongoose.model("AdminLog", adminLogSchema);