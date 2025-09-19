import prisma from "../utils/prismaClient.js";

export const createUser = async (req, res) => {
  try {
    const { email, name } = req.body;
    const user = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: { email, name },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
