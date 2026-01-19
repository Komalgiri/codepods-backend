import express from "express";
import { createReward } from "../controllers/rewardController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.post("/", authMiddleware, createReward); // POST /api/rewards

export default router;

