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
