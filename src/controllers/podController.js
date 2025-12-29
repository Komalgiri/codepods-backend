import prisma from "../utils/prismaClient.js";

export const createPod = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id; // From authMiddleware

    // 🔹 Step 1: Check if user linked GitHub
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { githubId: true },
    });

    if (!user || !user.githubId) {
      return res.status(403).json({
        error: "GitHub account not linked. Please connect your GitHub before creating a pod.",
      });
    }

    // 🔹 Step 2: Proceed with pod creation
    const pod = await prisma.pod.create({
      data: {
        name,
        description,
        members: {
          create: {
            userId,
            role: "admin", // creator becomes admin
          },
        },
      },
      include: { members: true },
    });

    return res.status(201).json({
      message: "Pod created successfully ✅",
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
      message: "Member added successfully ✅",
      member: podMember,
    });
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};