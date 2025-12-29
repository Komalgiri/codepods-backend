import express from "express";
import { signup, login } from "../controllers/userController.js";
import { getUserRewards } from "../controllers/rewardController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/:id/rewards", authMiddleware, getUserRewards); // GET /api/users/:id/rewards

export default router;
