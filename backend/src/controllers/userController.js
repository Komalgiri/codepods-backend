// controllers/userController.js
import prisma from "../utils/prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // check duplicate email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        githubId: user.githubId,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        githubId: user.githubId,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user profile including pods and rewards
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Or from params if viewing others

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        githubId: true,
        createdAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch pods
    const memberships = await prisma.podMember.findMany({
      where: { userId },
      include: {
        pod: true
      }
    });

    // Fetch rewards
    const rewards = await prisma.reward.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch activities
    const activities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const totalPoints = rewards.reduce((sum, r) => sum + (r.points || 0), 0);

    res.json({
      user,
      pods: memberships.map(m => ({ ...m.pod, role: m.role })),
      rewards,
      totalPoints,
      activities,
      badgeCount: [...new Set(rewards.flatMap(r => r.badges))].length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /users/search?q=... - Search users by name or email
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ users: [] });

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      take: 10,
    });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// PATCH /users/profile - Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, githubUsername, techStack, inferredRole } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(githubUsername && { githubUsername }),
        ...(techStack && { techStack }),
        ...(inferredRole && { inferredRole }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        githubUsername: true,
        githubId: true,
      }
    });

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
