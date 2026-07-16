import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, minlength: 6, select: false },
    role: { type: String, enum: ["client", "freelancer", "admin"], default: "client" },
    avatar: { type: String, default: "" },
    bio: String,
    phone: String,
    location: {
      city: String,
      coordinates: { type: [Number], index: "2dsphere", default: [0, 0] }, // [lng, lat]
    },
    // ---- Freelancer profile ----
    skills: [{ name: String, proficiency: { type: String, enum: ["beginner", "intermediate", "expert"], default: "intermediate" } }],
    portfolio: [{ title: String, description: String, image: String, link: String }],
    resume: String,
    certifications: [{ title: String, issuer: String, year: Number, file: String }],
    experience: [{ company: String, role: String, from: Date, to: Date, description: String }],
    hourlyRate: { type: Number, default: 0 },
    availability: [{ date: Date, slots: [{ start: String, end: String, booked: { type: Boolean, default: false }, bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" } }] }],
    isVerifiedBadge: { type: Boolean, default: false },
    reputationScore: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 },
    // ---- Auth extras ----
    isEmailVerified: { type: Boolean, default: false },
    emailVerifyToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    googleId: String,
    isSuspended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;

  this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model("User", userSchema);