import prisma from "../utils/prismaClient.js";

// POST /rewards - Add reward points
export const createReward = async (req, res) => {
  try {
    const { userId, points, reason, badges = [] } = req.body;
    const currentUserId = req.user.id; // From authMiddleware

    // Loophole Fix: Only global admins should be able to manually create rewards
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Forbidden: Only admins can manually award rewards.",
      });
    }

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
            rewards: {
              select: { points: true }
            },
            activities: {
              where: { podId }, // Points specific to THIS pod
              select: { value: true }
            },
          },
        },
      },
    });

    // Calculate total points for each member and sort
    const leaderboard = members
      .map((member) => {
        // Loophole Fix: Only count activities and rewards linked to THIS POD
        // Note: Reward schema doesn't have podId currently, so we use activities which DO have podId.
        // If we want special 'Pod Rewards', we'd need a podId on Reward model too.
        // For now, let's count all activities in this pod.
        const podPoints = member.user.activities.reduce((sum, a) => sum + (a.value || 0), 0);

        return {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          role: member.role,
          totalPoints: podPoints, // Pod-specific points
          githubUsername: member.user.githubUsername,
          status: member.status,
          badges: [...new Set(member.user.rewards.flatMap(r => r.badges || []))], // Badges are still global 'bragging rights'
          level: Math.floor(podPoints / 500) + 1,
        };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints);

    // 🛡️ ANTI-FARMING: Calculate Pod Validity
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const podActivityCount = await prisma.activity.count({
      where: {
        podId,
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    const activeMemberCount = members.filter(m => m.status === 'accepted').length;

    const validity = {
      isValid: activeMemberCount >= 3 && podActivityCount >= 10,
      reasons: [],
      activeMemberCount,
      podActivityCount
    };

    if (activeMemberCount < 3) validity.reasons.push("Minimum 3 ACTIVE (Accepted) members required for competitive ranking");
    if (podActivityCount < 10) validity.reasons.push(`Insufficient recent activity (${podActivityCount}/10 events in 30 days)`);

    return res.status(200).json({
      leaderboard,
      validity
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

    // 1. Fetch recent rewards (badges/manual points)
    const recentRewards = await prisma.reward.findMany({
      where: {
        userId: { in: userIds },
        OR: [
          { badges: { isEmpty: false } }, // Achievements with badges
          { points: { gt: 0 } }            // Or just actual points given
        ]
      },
      include: {
        user: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // 2. Fetch recent activities (commits, prs, etc.)
    const recentActivities = await prisma.activity.findMany({
      where: {
        podId,
        value: { gt: 0 }
      },
      include: {
        user: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // 3. Merge and format
    const formattedRewards = recentRewards.map(r => ({
      id: r.id,
      user: r.user.name,
      badge: r.badges[0] || (r.points >= 100 ? 'milestone' : 'reward'),
      points: r.points,
      reason: r.reason || 'Awarded points',
      time: r.createdAt,
      type: 'reward'
    }));

    const formattedActivities = recentActivities.map(a => {
      let badgeType = 'activity';
      let title = a.type;

      if (a.type === 'commit') { badgeType = 'committer'; title = 'Commit Author'; }
      if (a.type === 'pr_opened') { badgeType = 'pr-open'; title = 'PR Creator'; }
      if (a.type === 'pr_merged') { badgeType = 'super-committer'; title = 'Code Merger'; }

      return {
        id: a.id,
        user: a.user.name,
        badge: badgeType,
        points: a.value,
        reason: `${title} (${a.meta?.repoName || 'Repo'})`,
        time: a.createdAt,
        type: 'activity'
      };
    });

    const combined = [...formattedRewards, ...formattedActivities]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 15);

    return res.status(200).json({
      achievements: combined
    });

  } catch (error) {
    console.error("Error fetching achievements:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
