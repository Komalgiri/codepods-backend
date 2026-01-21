import express from "express";
import { createPod, getPod, addMember, getPodStats, getUserPods, updatePod, getPodActivities, updateMemberRole, syncPodActivity } from "../controllers/podController.js";
import { createTask, getTasksByPod } from "../controllers/taskController.js";
import { getPodLeaderboard, getPodAchievements } from "../controllers/rewardController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
console.log("[DEBUG] Initializing podRoutes");

// Protected routes
router.get("/", authMiddleware, getUserPods); // GET /api/pods
router.post("/", authMiddleware, createPod); // POST /api/pods
router.post("/create", authMiddleware, createPod); // Keep for backward compatibility
router.get("/:id", authMiddleware, getPod); // GET /api/pods/:id
router.patch("/:id", authMiddleware, updatePod); // PATCH /api/pods/:id
router.post("/:id/members", authMiddleware, addMember); // POST /api/pods/:id/members
router.patch("/:id/members/:memberId", authMiddleware, updateMemberRole); // PATCH /api/pods/:id/members/:memberId
console.log("[DEBUG] Registering POST /:id/sync");
router.post("/:id/sync", authMiddleware, syncPodActivity); // POST /api/pods/:id/sync

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
