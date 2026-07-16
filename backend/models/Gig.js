import mongoose from "mongoose";

const gigSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    skillsRequired: [String],
    budgetMin: { type: Number, required: true },
    budgetMax: { type: Number, required: true },
    attachments: [String],
    location: {
      city: String,
      coordinates: { type: [Number], index: "2dsphere", default: [0, 0] },
    },
    milestones: [
      {
        title: String,
        amount: Number,
        dueDate: Date,
        status: { type: String, enum: ["pending", "in-progress", "completed", "paid"], default: "pending" },
      },
    ],
    tasks: [
      {
        title: String,
        done: { type: Boolean, default: false },
        files: [String],
        logs: [{ note: String, at: { type: Date, default: Date.now } }],
      },
    ],
    invitedFreelancers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    hiredFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["pending-approval", "open", "in-progress", "completed", "cancelled"], default: "pending-approval" },
    deadline: Date,
    experienceLevel: { type: String, enum: ["beginner", "intermediate", "expert"], default: "intermediate" },
  },
  { timestamps: true }
);

gigSchema.index({ title: "text", description: "text", skillsRequired: "text" });
export default mongoose.model("Gig", gigSchema);