
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getNotifications, markAsRead, markAllAsRead } from "../controllers/notificationController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getNotifications);
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);

export default router;
