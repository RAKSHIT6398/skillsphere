import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    gig: { type: mongoose.Schema.Types.ObjectId, ref: "Gig" },
    lastMessage: String,
    lastMessageAt: Date,
      // Chat kis user ke liye hidden hai
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
mutedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  
  { timestamps: true },
  
);
export default mongoose.model("Conversation", conversationSchema);