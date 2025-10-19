import { Router } from "express";
import Contest from "../models/Contest.js";

const router = Router();

router.get("/", async (req, res) => {
  const now = new Date();
  const contests = await Contest.find({ startTime: { $gte: now } })
    .sort({ startTime: 1 })
    .lean();
  res.json(contests);
});

export default router;
