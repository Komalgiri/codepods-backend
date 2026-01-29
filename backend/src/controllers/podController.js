import prisma from "../utils/prismaClient.js";
import { Octokit } from "octokit";
import { syncRepoActivity } from "../services/githubService.js";

// GET /pods - Fetch all pods for the current user
export const getUserPods = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`[DEBUG] Fetching pods for userId: ${userId}`);

    const memberships = await prisma.podMember.findMany({
      where: { userId },
      include: {
        pod: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    githubUsername: true,
                    githubId: true,
                    reliabilityScore: true,
                    dynamicsMetrics: true,
                    inferredRole: true,
                    techStack: true,
                    roleAnalysis: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    console.log(`[DEBUG] Found ${memberships.length} memberships for user ${userId}`);

    const pods = memberships.map((m) => ({
      ...m.pod,
      role: m.role,
      status: m.status, // Include status
    }));

    return res.status(200).json({ pods });
  } catch (error) {
    console.error("Error fetching user pods:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createPod = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id; // From authMiddleware

    // dY"1 Step 1: Check if user linked GitHub
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { githubId: true },
    });

    if (!user || !user.githubId) {
      return res.status(403).json({
        error: "GitHub account not linked. Please connect your GitHub before creating a pod.",
      });
    }

    // dY"1 Step 2: Proceed with pod creation
    const pod = await prisma.pod.create({
      data: {
        name,
        description,
        members: {
          create: {
            userId,
            role: "admin", // creator becomes admin
            status: "accepted", // Creator is always accepted
          },
        },
      },
      include: { members: true },
    });

    return res.status(201).json({
      message: "Pod created successfully 🚀.",
      pod,
    });

  } catch (error) {
    console.error("Error creating pod:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /pods/:id - Fetch pod details with members & tasks
export const getPod = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // From authMiddleware

    // Check if user is a member of the pod
    const membership = await prisma.podMember.findUnique({
      where: {
        userId_podId: {
          userId,
          podId: id,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({
        error: "You are not a member of this pod",
      });
    }

    // If pending, they can only see basic info or we warn them?
    // For now, let them see it so they can decide to join.

    // Fetch pod with members and tasks
    const pod = await prisma.pod.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                githubUsername: true,
                githubId: true,
                reliabilityScore: true,
                dynamicsMetrics: true,
                inferredRole: true,
                techStack: true,
                roleAnalysis: true,
              },
            },
          },
        },
        tasks: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!pod) {
      return res.status(404).json({ error: "Pod not found" });
    }

    return res.status(200).json({
      pod,
      userStatus: membership.status, // Let frontend know if they are pending
    });
  } catch (error) {
    console.error("Error fetching pod:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /pods/:id/members - Add member to pod
export const addMember = async (req, res) => {
  try {
    const { id: podId } = req.params;
    const { userId, role = "member" } = req.body;
    const currentUserId = req.user.id; // From authMiddleware

    // Check if current user is admin or maintainer of the pod
    const currentMembership = await prisma.podMember.findUnique({
      where: {
        userId_podId: {
          userId: currentUserId,
          podId,
        },
      },
    });

    if (!currentMembership || (currentMembership.role !== "admin" && currentMembership.role !== "maintainer")) {
      return res.status(403).json({
        error: "Only admins and maintainers can add members",
      });
    }

    // Check if pod exists
    const pod = await prisma.pod.findUnique({
      where: { id: podId },
    });

    if (!pod) {
      return res.status(404).json({ error: "Pod not found" });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user is already a member
    const existingMember = await prisma.podMember.findUnique({
      where: {
        userId_podId: {
          userId,
          podId,
        },
      },
    });

    if (existingMember) {
      return res.status(400).json({ error: "User is already a member of this pod" });
    }

    // Add member
    const podMember = await prisma.podMember.create({
      data: {
        userId,
        podId,
        role: role || "member",
        status: "pending", // Invite is pending
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

    // We do NOT invalidate roadmap yet, only when they accept.

    return res.status(201).json({
      message: "Invitation sent successfully 🚀.",
      member: podMember,
    });
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /pods/:id/stats - Get aggregated stats for the pod
export const getPodStats = async (req, res) => {
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

    // Parallel fetch for potential performance win
    const [tasks, commitActivities, prActivities] = await Promise.all([
      prisma.task.findMany({
        where: { podId },
        select: { status: true }
      }),
      prisma.activity.findMany({
        where: { podId, type: 'commit' },
        select: { id: true }
      }),
      prisma.activity.findMany({
        where: {
          podId,
          type: { in: ['pr_opened', 'pr_merged'] }
        },
        select: { id: true }
      })
    ]);

    // Calculate Task Stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate GitHub Stats
    const commitsCount = commitActivities.length;
    const prsCount = prActivities.length;

    // Weekly Stats (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Note: activity.createdAt is what we check
    // Since we didn't include createdAt in the initial select, we need to add it or fetch again
    // Let's refetch with createdAt for accuracy
    const [weeklyCommitsCount, weeklyPrsCount] = await Promise.all([
      prisma.activity.count({
        where: {
          podId,
          type: 'commit',
          createdAt: { gte: sevenDaysAgo }
        }
      }),
      prisma.activity.count({
        where: {
          podId,
          type: { in: ['pr_opened', 'pr_merged'] },
          createdAt: { gte: sevenDaysAgo }
        }
      })
    ]);

    const stats = {
      commits: {
        value: commitsCount.toString(),
        trend: weeklyCommitsCount > 0 ? `+${weeklyCommitsCount} this week` : '0 this week',
        trendUp: true,
        unit: ''
      },
      prs: {
        value: prsCount.toString(),
        trend: weeklyPrsCount > 0 ? `+${weeklyPrsCount} this week` : '0 this week',
        trendUp: true,
        unit: ''
      },
      weeklyCommits: {
        value: weeklyCommitsCount.toString(),
        unit: 'this week'
      },
      uptime: { value: '99.9', unit: '%', trend: 'Stable', trendUp: true },
      health: completionRate
    };

    return res.status(200).json({ stats });

  } catch (error) {
    console.error("Error fetching pod stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH /pods/:id - Update pod details (like repository)
export const updatePod = async (req, res) => {
  try {
    const { id: podId } = req.params;
    const { name, description, repoOwner, repoName } = req.body;
    const userId = req.user.id;

    // Check if user is admin
    const membership = await prisma.podMember.findUnique({
      where: {
        userId_podId: {
          userId,
          podId,
        },
      },
    });

    if (!membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can update pod details" });
    }

    const updatedPod = await prisma.pod.update({
      where: { id: podId },
      data: {
        name,
        description,
        repoOwner,
        repoName
      },
    });

    // If repository information was updated, trigger a sync
    if (repoOwner && repoName) {
      console.log(`[DEBUG] Triggering GitHub sync for pod ${podId} with repo ${repoOwner}/${repoName}`);
      syncRepoActivity(podId, repoOwner, repoName)
        .then(results => console.log(`[DEBUG] Sync completed for pod ${podId}:`, results))
        .catch(err => console.error(`[ERROR] Sync failed for pod ${podId}:`, err));
    }

    return res.status(200).json({
      message: "Pod updated successfully 🚀",
      pod: updatedPod,
    });
  } catch (error) {
    console.error("Error updating pod:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /pods/:id/activities - Fetch activities for the pod
export const getPodActivities = async (req, res) => {
  try {
    const { id: podId } = req.params;
    const userId = req.user.id;

    // Check membership
    const membership = await prisma.podMember.findUnique({
      where: {
        userId_podId: {
          userId,
          podId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ error: "You are not a member of this pod" });
    }

    const activities = await prisma.activity.findMany({
      where: { podId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            githubUsername: true,
            reliabilityScore: true,
            dynamicsMetrics: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return res.status(200).json({ activities });
  } catch (error) {
    console.error("Error fetching pod activities:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH /pods/:id/members/:memberId - Update member role
export const updateMemberRole = async (req, res) => {
  try {
    const { id: podId, memberId } = req.params;
    const { role } = req.body;
    const userId = req.user.id;

    // Check if requester is admin
    const requesterMembership = await prisma.podMember.findUnique({
      where: {
        userId_podId: {
          userId,
          podId,
        },
      },
    });

    if (!requesterMembership || requesterMembership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can change roles" });
    }

    // Update member role
    const updatedMember = await prisma.podMember.update({
      where: { id: memberId },
      data: { role },
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

    return res.status(200).json({
      message: "Member role updated successfully",
      member: updatedMember,
    });
  } catch (error) {
    console.error("Error updating member role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /pods/:id/sync - Trigger a manual sync of repository activity
export const syncPodActivity = async (req, res) => {
  try {
    const { id: podId } = req.params;
    const userId = req.user.id;

    // Check if pod exists and user is a member
    const pod = await prisma.pod.findUnique({
      where: { id: podId },
      include: {
        members: {
          where: { userId }
        }
      }
    });

    if (!pod) return res.status(404).json({ error: "Pod not found in controller" });
    if (pod.members.length === 0) return res.status(403).json({ error: "Not a member" });

    if (!pod.repoOwner || !pod.repoName) {
      return res.status(400).json({ error: "No repository linked to this pod" });
    }

    // Trigger sync
    const results = await syncRepoActivity(podId, pod.repoOwner, pod.repoName);

    return res.status(200).json({
      message: "Sync completed",
      results
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /pods/:id/join - Respond to pod invitation
export const respondToInvite = async (req, res) => {
  try {
    const { id: podId } = req.params;
    const { status } = req.body; // "accepted" or "rejected"
    const userId = req.user.id;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Use 'accepted' or 'rejected'." });
    }

    // Check membership
    const membership = await prisma.podMember.findUnique({
      where: {
        userId_podId: {
          userId,
          podId,
        },
      },
    });

    if (!membership) {
      return res.status(404).json({ error: "Invitation not found." });
    }

    if (membership.status === "accepted") {
      return res.status(400).json({ error: "You are already a member of this pod." });
    }

    if (status === "rejected") {
      // Remove membership
      await prisma.podMember.delete({
        where: { id: membership.id },
      });
      return res.json({ message: "Invitation rejected." });
    }

    // Accept invitation
    const updatedMember = await prisma.podMember.update({
      where: { id: membership.id },
      data: { status: "accepted" },
      include: { pod: true }
    });

    // Invalidate AI roadmap since we have a new active member
    await prisma.pod.update({
      where: { id: podId },
      data: {
        aiRoadmap: null,
        roadmapUpdatedAt: null
      }
    });

    res.json({ message: "Welcome to the pod! 🚀", member: updatedMember });

  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /pods/:id - Delete a pod (Admin only)
export const deletePod = async (req, res) => {
  try {
    const { id: podId } = req.params;
    const userId = req.user.id;

    // Check if user is admin of the pod
    const membership = await prisma.podMember.findUnique({
      where: { userId_podId: { userId, podId } },
    });

    if (!membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only pod admins can delete the pod." });
    }

    // Delete tasks, activities, and members first (Prisma handles relations if defined, but being explicit is safer)
    await prisma.$transaction([
      prisma.task.deleteMany({ where: { podId } }),
      prisma.activity.deleteMany({ where: { podId } }),
      prisma.podMember.deleteMany({ where: { podId } }),
      prisma.pod.delete({ where: { id: podId } }),
    ]);

    res.json({ message: "Pod deleted successfully." });
  } catch (error) {
    console.error("Error deleting pod:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /pods/:id/leave - Leave a pod
export const leavePod = async (req, res) => {
  try {
    const { id: podId } = req.params;
    const userId = req.user.id;

    // Check membership
    const membership = await prisma.podMember.findUnique({
      where: { userId_podId: { userId, podId } },
    });

    if (!membership) {
      return res.status(404).json({ error: "You are not a member of this pod." });
    }

    // Loophole check: If admin, ensure they aren't the ONLY admin
    if (membership.role === "admin") {
      const adminCount = await prisma.podMember.count({
        where: { podId, role: "admin" },
      });
      if (adminCount <= 1) {
        return res.status(400).json({
          error: "You are the last admin. Transfer ownership or delete the pod instead."
        });
      }
    }

    await prisma.podMember.delete({
      where: { id: membership.id },
    });

    res.json({ message: "You have left the pod." });
  } catch (error) {
    console.error("Error leaving pod:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
