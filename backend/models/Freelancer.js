import mongoose from "mongoose";

const freelancerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    // ---- Skills with proficiency ----
    skills: [
      {
        name: { type: String, required: true },
        proficiency: {
          type: String,
          enum: ["beginner", "intermediate", "expert"],
          default: "intermediate",
        },
      },
    ],

    // ---- Portfolio gallery ----
    portfolio: [
      {
        title: String,
        description: String,
        image: String,
        link: String,
      },
    ],

    // ---- Resume upload ----
    resume: String,

    // ---- Certifications ----
    certifications: [
      {
        title: String,
        issuer: String,
        year: Number,
        file: String,
      },
    ],

    // ---- Work experience timeline ----
    experience: [
      {
        company: String,
        role: String,
        from: Date,
        to: Date,
        description: String,
      },
    ],

    // ---- Hourly & milestone pricing ----
    hourlyRate: { type: Number, default: 0 },
    milestoneRates: [{ label: String, amount: Number }],

    // ---- Availability calendar ----
    availability: [
      {
        date: Date,
        slots: [
          {
            start: String,
            end: String,
            booked: { type: Boolean, default: false },
            bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          },
        ],
      },
    ],

    // ---- Verification badge system ----
    isVerifiedBadge: { type: Boolean, default: false },
    verificationDocs: [String],
    verificationStatus: {
      type: String,
      enum: ["not-applied", "pending", "approved", "rejected"],
      default: "not-applied",
    },

    // ---- Reputation & stats ----
    reputationScore: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 },
    profileViewHistory: [{
  date: { type: Date, default: Date.now },
  count: { type: Number, default: 1 }
}],
    totalEarnings: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Freelancer", freelancerSchema);