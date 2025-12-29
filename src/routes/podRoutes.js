import express from "express";
import { createPod, getPod, addMember } from "../controllers/podController.js";
import { createTask } from "../controllers/taskController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.post("/", authMiddleware, createPod); // POST /api/pods
router.post("/create", authMiddleware, createPod); // Keep for backward compatibility
router.get("/:id", authMiddleware, getPod); // GET /api/pods/:id
router.post("/:id/members", authMiddleware, addMember); // POST /api/pods/:id/members
router.post("/:id/tasks", authMiddleware, createTask); // POST /api/pods/:id/tasks

export default router;
