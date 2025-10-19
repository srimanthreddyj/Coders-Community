import dotenv from "dotenv"; // load env first
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cron from "node-cron";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import contestRoutes from "./routes/contests.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import postRoutes from "./routes/posts.js";
import refreshContests from "./services/refreshContests.js";
import updateAllUsersStats from "./services/updateUserStats.js";
import { seedMockUsers } from "./services/leaderboardService.js";
import "./models/User.js"; // Import User model to register schema

const app = express();

// --- Security & middleware ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

// --- Routes ---
app.get("/api/health", (_, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

const startServer = async () => {
  try {
    // --- Database ---
    await connectDB();

    // Seed database with mock users for leaderboard testing
    await seedMockUsers();

    // --- Initial data fetch & scheduled jobs ---
    console.log("🔄 Running initial contest refresh...");
    await refreshContests();

    // Run initial user stats update
    console.log("🔄 Running initial user stats update...");
    await updateAllUsersStats();

    // Schedule contest refresh every 6 hours
    cron.schedule("0 */6 * * *", async () => {
      console.log("🔄 Scheduled contest refresh...");
      await refreshContests();
    });

    // Schedule user stats update every 24 hours (at midnight)
    cron.schedule("0 0 * * *", async () => {
      console.log("🔄 Scheduled user stats update...");
      await updateAllUsersStats();
    });

    // --- Server start ---
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
