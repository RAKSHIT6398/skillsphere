import express from "express";
import crypto from "crypto";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import { protect } from "../middleware/auth.js";
import Freelancer from "../models/Freelancer.js";
import Client from "../models/Client.js";
import { verifyEmailTemplate, resetPasswordTemplate } from "../utils/emailTemplates.js";
const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const userResponse = (u) => ({
  _id: u._id, name: u.name, email: u.email, role: u.role, avatar: u.avatar,
  isEmailVerified: u.isEmailVerified, isVerifiedBadge: u.isVerifiedBadge,
  twoFactorEnabled: u.twoFactorEnabled, reputationScore: u.reputationScore,
});

// REGISTER
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const emailVerifyToken = crypto.randomBytes(20).toString("hex");

    const user = await User.create({
      name,
      email,
      password,
      role: role === "admin" ? "client" : role,
      emailVerifyToken,
    });

    // Create role-specific profile
    if (user.role === "freelancer") {
      await Freelancer.create({
        user: user._id,
      });
    } else {
      await Client.create({
        user: user._id,
      });
    }

    const url = `${process.env.CLIENT_URL}/verify-email/${emailVerifyToken}`;

  sendEmail({
  to: email,
  subject: "✉️ Verify your email | SkillSphere",
  html: verifyEmailTemplate(name, url),
}).catch(() => {});

    res.status(201).json({
      token: generateToken(user._id),
      user: userResponse(user),
    });
  } catch (e) {
    next(e);
  }
});

// VERIFY EMAIL
router.get("/verify-email/:token", async (req, res, next) => {
  try {
    const user = await User.findOne({ emailVerifyToken: req.params.token });
    if (!user) return res.status(400).json({ message: "Invalid token" });
    user.isEmailVerified = true;
    user.emailVerifyToken = undefined;
    await user.save();
    res.json({ message: "Email verified successfully" });
  } catch (e) { next(e); }
});

// LOGIN (step 1 — if 2FA on, requires code)
router.post("/login", async (req, res, next) => {
  try {
    const { email, password, twoFactorCode } = req.body;
    const user = await User.findOne({ email }).select("+password +twoFactorSecret");
    if (!user || !user.password || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });
    if (user.isSuspended) return res.status(403).json({ message: "Account suspended by admin" });

    if (user.twoFactorEnabled) {
      if (!twoFactorCode) return res.json({ twoFactorRequired: true });
      const ok = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: "base32", token: twoFactorCode, window: 1 });
      if (!ok) return res.status(401).json({ message: "Invalid 2FA code" });
    }
    res.json({ token: generateToken(user._id), user: userResponse(user) });
  } catch (e) { next(e); }
});

// GOOGLE OAUTH (frontend sends credential from Google button)
// GOOGLE OAUTH
router.post("/google", async (req, res, next) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: req.body.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture, sub } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId: sub,
        avatar: picture,
        isEmailVerified: true,
        role: req.body.role || "client",
      });

      // Create role-specific profile
      if (user.role === "freelancer") {
        await Freelancer.create({
          user: user._id,
        });
      } else {
        await Client.create({
          user: user._id,
        });
      }
    }

    res.json({
      token: generateToken(user._id),
      user: userResponse(user),
    });
  } catch (e) {
    next(e);
  }
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "No account with that email" });
    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    await user.save();
    const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await sendEmail({
  to: user.email,
  subject: "🔑 Reset your password | SkillSphere",
  html: resetPasswordTemplate(user.name, url),
});
    res.json({ message: "Reset email sent" });
  } catch (e) { next(e); }
});

// RESET PASSWORD
router.put("/reset-password/:token", async (req, res, next) => {
  try {
    const hashed = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ message: "Password reset successful" });
  } catch (e) { next(e); }
});

// 2FA SETUP
router.post("/2fa/setup", protect, async (req, res, next) => {
  try {
    const secret = speakeasy.generateSecret({ name: `SkillSphere (${req.user.email})` });
    req.user.twoFactorSecret = secret.base32;
    await req.user.save();
    
    // 1. Email notification bhejein
    try {
      await sendEmail({
        to: req.user.email,
        subject: "Security Notification: 2FA Setup Initiated",
        text: "You have initiated the 2FA setup for your SkillSphere account. If this was not you, please secure your account immediately."
      });
    } catch (emailError) {
      console.error("Failed to send 2FA setup email:", emailError);
    }

    // 2. QR code generate karein
    const qr = await qrcode.toDataURL(secret.otpauth_url);
    res.json({ qr, secret: secret.base32 });
    
  } catch (e) { next(e); }
});

// 2FA VERIFY & ENABLE
router.post("/2fa/verify", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("+twoFactorSecret");
    
    if (!user.twoFactorSecret) {
      return res.status(400).json({ message: "2FA not initiated. Please setup first." });
    }

    const ok = speakeasy.totp.verify({ 
      secret: user.twoFactorSecret, 
      encoding: "base32", 
      token: req.body.code, 
      window: 1 
    });

    if (!ok) return res.status(400).json({ message: "Invalid code" });

    // Enable 2FA
    user.twoFactorEnabled = true;
    await user.save();

    // Notification Email
    try {
      await sendEmail({
        to: user.email,
        subject: "Security: 2FA Enabled Successfully",
        text: "Your account is now protected with Two-Factor Authentication."
      });
    } catch (err) {
      console.error("Email notification failed:", err);
    }

    res.json({ message: "2FA enabled" });
  } catch (e) { next(e); }
});
// POST /api/auth/disable-2fa
router.post('/disable-2fa', protect, async (req, res) => {

    const { email, password } = req.body;
  const userId = req.user.id; 

  try {
    // 1. Fetch user and include the password field explicitly
    const user = await User.findById(userId).select('+password');
    
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Verify Email and use the correct method 'matchPassword'
    const isMatch = await user.matchPassword(password);
    
    if (user.email !== email || !isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Disable 2FA
    user.twoFactorEnabled = false;
    await user.save();

    // 4. Send Email Notification
    try {
      await sendEmail({
        to: user.email,
        subject: "Security Alert: 2FA Disabled",
        text: "Your 2FA has been successfully disabled. If this was not you, please contact support immediately."
      });
    } catch (emailError) {
      console.log("Email sending failed:", emailError);
    }

    res.json({ message: "2FA disabled successfully" });
  } catch (error) {
    console.error("DEBUG ERROR:", error); // Terminal mein error dekhne ke liye
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/me", protect, (req, res) => res.json({ user: req.user }));

export default router;