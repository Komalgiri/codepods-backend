import express from "express";
import { createPod, getPod, addMember, getPodStats, getUserPods, updatePod, getPodActivities, updateMemberRole, syncPodActivity, respondToInvite, leavePod, deletePod } from "../controllers/podController.js";
import { createTask, getTasksByPod } from "../controllers/taskController.js";
import { getPodLeaderboard, getPodAchievements } from "../controllers/rewardController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { syncLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Protected routes
router.get("/", authMiddleware, getUserPods);
router.post("/", authMiddleware, createPod);
router.post("/create", authMiddleware, createPod); // Keep for backward compatibility
router.get("/:id", authMiddleware, getPod);
router.patch("/:id", authMiddleware, updatePod);
router.post("/:id/members", authMiddleware, addMember);
router.patch("/:id/members/:memberId", authMiddleware, updateMemberRole);

// 🛡️ Sync endpoint with rate limiting
router.post("/:id/sync", authMiddleware, syncLimiter, syncPodActivity);

router.post("/:id/join", authMiddleware, respondToInvite);
router.post("/:id/leave", authMiddleware, leavePod);
router.delete("/:id", authMiddleware, deletePod);

// Task Routes
router.post("/:id/tasks", authMiddleware, createTask); // POST /api/pods/:id/tasks
router.get("/:id/tasks", authMiddleware, getTasksByPod); // GET /api/pods/:id/tasks

// Leaderboard Route
router.get("/:id/leaderboard", authMiddleware, getPodLeaderboard); // GET /api/pods/:id/leaderboard

// Achievements Route
router.get("/:id/achievements", authMiddleware, getPodAchievements); // GET /api/pods/:id/achievements

// Activity Route
router.get("/:id/activities", authMiddleware, getPodActivities); // GET /api/pods/:id/activities

// Stats Route
router.get("/:id/stats", authMiddleware, getPodStats); // GET /api/pods/:id/stats

export default router;
