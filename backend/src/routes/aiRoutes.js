import express from "express";
import { getPodRoadmap, suggestTasks } from "../controllers/aiController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// All AI routes are protected
router.get("/pods/:id/plan", authMiddleware, getPodRoadmap);
router.post("/pods/:id/suggest-tasks", authMiddleware, suggestTasks);

export default router;
