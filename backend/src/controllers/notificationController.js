
import prisma from "../utils/prismaClient.js";

// GET /api/notifications - Get user's notifications
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        // Count unread
        const unreadCount = await prisma.notification.count({
            where: { userId, read: false }
        });

        res.json({ notifications, unreadCount });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// PATCH /api/notifications/:id/read - Mark as read
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await prisma.notification.findUnique({ where: { id } });

        if (!notification || notification.userId !== userId) {
            return res.status(404).json({ error: "Notification not found" });
        }

        await prisma.notification.update({
            where: { id },
            data: { read: true }
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

// PATCH /api/notifications/read-all - Mark all as read
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};
