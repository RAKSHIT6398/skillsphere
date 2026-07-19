import dotenv from "dotenv";
dotenv.config();
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import { initSocket } from "./socket/socket.js";
import { notFound, errorHandler } from "./middleware/error.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import gigRoutes from "./routes/gigRoutes.js";
import proposalRoutes from "./routes/proposalRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import disputeRoutes from "./routes/disputeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

connectDB();
const app = express();
const server = http.createServer(app);
initSocket(server);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));
console.log("HOST =", process.env.SMTP_HOST);
console.log("PORT =", process.env.SMTP_PORT);
console.log("USER =", process.env.SMTP_USER);
console.log("FROM =", process.env.EMAIL_FROM);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => res.json({ status: "SkillSphere API running 🚀" }));
app.use(notFound);
app.use(errorHandler);

server.listen(process.env.PORT || 5000, () =>
  console.log(`🚀 Server on port ${process.env.PORT || 5000}`));