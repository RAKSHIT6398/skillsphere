import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["new-gig", "proposal-accepted", "proposal-received", "payment", "review", "message", "dispute", "system"], default: "system" },
    title: String,
    body: String,
    link: String,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export default mongoose.model("Notification", notificationSchema);