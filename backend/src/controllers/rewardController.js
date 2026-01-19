import prisma from "../utils/prismaClient.js";

// POST /rewards - Add reward points
export const createReward = async (req, res) => {
  try {
    const { userId, points, reason, badges = [] } = req.body;
    const currentUserId = req.user.id; // From authMiddleware

    // Validate required fields
    if (!userId || points === undefined) {
      return res.status(400).json({
        error: "userId and points are required",
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate points (should be positive)
    if (points < 0) {
      return res.status(400).json({
        error: "Points must be a positive number",
      });
    }

    // Validate badges if provided
    if (badges.length > 0) {
      const existingBadges = await prisma.badge.findMany({
        where: {
          slug: {
            in: badges,
          },
        },
      });

      if (existingBadges.length !== badges.length) {
        return res.status(400).json({
          error: "One or more badges do not exist",
        });
      }
    }

    // Create reward
    const reward = await prisma.reward.create({
      data: {
        userId,
        points,
        reason: reason || null,
        badges,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Reward created successfully ✅",
      reward,
    });
  } catch (error) {
    console.error("Error creating reward:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /users/:id/rewards - List a user's rewards
export const getUserRewards = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const currentUserId = req.user.id; // From authMiddleware

    // Users can only view their own rewards, or admins can view anyone's
    // For now, let's allow users to view their own rewards
    if (userId !== currentUserId) {
      // Check if current user is admin (optional: add admin check)
      // For simplicity, allowing users to view their own rewards only
      return res.status(403).json({
        error: "You can only view your own rewards",
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch rewards
    const rewards = await prisma.reward.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate total points
    const totalPoints = rewards.reduce((sum, reward) => sum + reward.points, 0);

    return res.status(200).json({
      userId,
      totalPoints,
      rewards,
      count: rewards.length,
    });
  } catch (error) {
    console.error("Error fetching user rewards:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

