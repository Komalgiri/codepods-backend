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
      message: "Reward created successfully 🚀.",
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

// GET /pods/:id/leaderboard - Get leaderboard for a pod
export const getPodLeaderboard = async (req, res) => {
  try {
    const { id: podId } = req.params;
    const userId = req.user.id; // From authMiddleware

    // Check if user is a member of the pod
    const membership = await prisma.podMember.findUnique({
      where: {
        userId_podId: {
          userId,
          podId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({
        error: "You are not a member of this pod",
      });
    }

    // Get all members of the pod
    const members = await prisma.podMember.findMany({
      where: { podId },
      include: {
        user: {
          include: {
            rewards: true, // Include rewards to calculate total points
          },
        },
      },
    });

    // Calculate total points for each member and sort
    const leaderboard = members
      .map((member) => {
        const totalPoints = member.user.rewards.reduce((sum, reward) => sum + reward.points, 0);
        return {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          role: member.role,
          totalPoints,
          // Add default badges or fetch from a 'UserBadges' relation if it existed
          badges: [],
          level: Math.floor(totalPoints / 1000) + 1, // Simple level calculation
        };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints);

    return res.status(200).json({
      leaderboard,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /pods/:id/achievements - Get recent achievements for a pod
export const getPodAchievements = async (req, res) => {
  try {
    const { id: podId } = req.params;
    const userId = req.user.id;

    // Check membership
    const membership = await prisma.podMember.findUnique({
      where: { userId_podId: { userId, podId } },
    });

    if (!membership) {
      return res.status(403).json({ error: "You are not a member of this pod" });
    }

    // Get members of the pod
    const members = await prisma.podMember.findMany({
      where: { podId },
      select: { userId: true }
    });

    const userIds = members.map(m => m.userId);

    // Fetch recent rewards for these users
    const achievements = await prisma.reward.findMany({
      where: {
        userId: { in: userIds },
        badges: { path: [], not: [] } // Has at least one badge
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return res.status(200).json({
      achievements: achievements.map(a => ({
        id: a.id,
        user: a.user.name,
        badge: a.badges[0], // Show the first badge for now
        points: a.points,
        reason: a.reason,
        time: a.createdAt
      }))
    });

  } catch (error) {
    console.error("Error fetching achievements:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
