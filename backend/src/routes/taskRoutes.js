import express from "express";
import { updateTaskStatus } from "../controllers/taskController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.patch("/:id/status", authMiddleware, updateTaskStatus); // PATCH /api/tasks/:id/status

export default router;

