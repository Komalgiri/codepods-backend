import express from "express";
import { signup, login, getProfile, searchUsers, updateProfile } from "../controllers/userController.js";
import { getUserRewards } from "../controllers/rewardController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authLimiter, searchLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

//  Auth endpoints with strict rate limiting
router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);

// Protected routes
router.get("/profile", authMiddleware, getProfile);
router.patch("/profile", authMiddleware, updateProfile);
router.get("/search", authMiddleware, searchLimiter, searchUsers);
router.get("/:id/rewards", authMiddleware, getUserRewards);

export default router;
