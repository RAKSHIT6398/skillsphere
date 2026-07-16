import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    gig: { type: mongoose.Schema.Types.ObjectId, ref: "Gig", required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    milestoneIndex: Number,
    amount: { type: Number, required: true },
    platformFee: { type: Number, default: 0 },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    status: { type: String, enum: ["created", "escrowed", "released", "refunded", "failed"], default: "created" },
  },
  { timestamps: true }
);
export default mongoose.model("Payment", paymentSchema);