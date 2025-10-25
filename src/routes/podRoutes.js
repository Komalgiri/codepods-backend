import express from "express";
import { createPod } from "../controllers/podController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected route
router.post("/create", authMiddleware, createPod);

export default router;
