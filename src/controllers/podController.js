import prisma from "../utils/prismaClient.js";

export const createPod = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id; // From authMiddleware

    const pod = await prisma.pod.create({
      data: {
        name,
        description,
        members: {
          create: {
            userId,
            role: "admin",  // creator becomes admin
          },
        },
      },
      include: { members: true },
    });

    res.json(pod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
