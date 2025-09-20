import prisma from "../utils/prismaClient.js";

export const createPod = async (req, res) => {
  try {
    const { name, description, userId } = req.body;

    const pod = await prisma.pod.create({
      data: {
        name,
        description,
        members: {
          create: { userId, role: "admin" },
        },
      },
    });

    res.json(pod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
