import prisma from "../utils/prismaClient.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
