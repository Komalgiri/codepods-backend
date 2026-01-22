import express from "express";
import { getUserRepos, getCommits, syncActivity, analyzeProfile } from "../controllers/githubController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes - require authentication
router.get("/repos", authMiddleware, getUserRepos); // GET /api/github/repos
router.get("/commits", authMiddleware, getCommits); // GET /api/github/commits
router.post("/sync", authMiddleware, syncActivity); // POST /api/github/sync
router.post("/analyze", authMiddleware, analyzeProfile); // POST /api/github/analyze

export default router;

