import express from "express";
import { getPodRoadmap, suggestTasks, chatWithAI } from "../controllers/aiController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// All AI routes are protected
router.get("/pods/:id/plan", authMiddleware, getPodRoadmap);
router.post("/pods/:id/suggest-tasks", authMiddleware, suggestTasks);
router.post("/pods/:id/chat", authMiddleware, chatWithAI);

export default router;
