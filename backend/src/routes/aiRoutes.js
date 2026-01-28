import express from "express";
import { getPodRoadmap, suggestTasks } from "../controllers/aiController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { aiLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// 🛡️ All AI routes are protected and rate-limited (expensive operations)
router.get("/pods/:id/plan", authMiddleware, aiLimiter, getPodRoadmap);
router.post("/pods/:id/suggest-tasks", authMiddleware, aiLimiter, suggestTasks);

export default router;

