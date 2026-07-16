import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    companyName: String,
    website: String,
    totalSpent: { type: Number, default: 0 },
    gigsPosted: { type: Number, default: 0 },
    hiredFreelancers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("Client", clientSchema);