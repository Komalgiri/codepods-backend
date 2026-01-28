import express from "express";
import { getUserRepos, getCommits, syncActivity, analyzeProfile } from "../controllers/githubController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { syncLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Protected routes - require authentication
router.get("/repos", authMiddleware, getUserRepos);
router.get("/commits", authMiddleware, getCommits);

// 🛡️ Sync endpoints with stricter rate limiting
router.post("/sync", authMiddleware, syncLimiter, syncActivity);
router.post("/analyze", authMiddleware, syncLimiter, analyzeProfile);

export default router;


