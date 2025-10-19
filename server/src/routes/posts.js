import { Router } from "express";
import Post from "../models/Post.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 }).limit(50).lean();
  res.json(posts);
});

router.post("/", requireAuth, async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: "Text required" });
  const post = await Post.create({ authorId: req.user.id, text: text.trim() });
  res.status(201).json(post);
});

router.post("/:id/comment", requireAuth, async (req, res) => {
  const { text } = req.body;
  await Post.findByIdAndUpdate(req.params.id, {
    $push: { comments: { authorId: req.user.id, text } }
  });
  res.json({ ok: true });
});

router.post("/:id/like", requireAuth, async (req, res) => {
  await Post.findByIdAndUpdate(req.params.id, {
    $addToSet: { likes: req.user.id }
  });
  res.json({ ok: true });
});

export default router;
