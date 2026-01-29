// controllers/userController.js
import prisma from "../utils/prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // check duplicate email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set in environment variables");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, githubId: user.githubId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        githubId: user.githubId,
        techStack: user.techStack,
        inferredRole: user.inferredRole,
        roleAnalysis: user.roleAnalysis,
        reliabilityScore: user.reliabilityScore || 100,
        dynamicsMetrics: user.dynamicsMetrics || {},
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};


// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    // Check if user has a password (GitHub-only users don't have passwords)
    if (!user.password) {
      return res.status(400).json({ error: "This account was created with GitHub. Please use GitHub login." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set in environment variables");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, githubId: user.githubId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        githubId: user.githubId,
        techStack: user.techStack,
        inferredRole: user.inferredRole,
        roleAnalysis: user.roleAnalysis,
        reliabilityScore: user.reliabilityScore || 100,
        dynamicsMetrics: user.dynamicsMetrics || {},
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
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
        techStack: true,
        inferredRole: true,
        roleAnalysis: true,
        createdAt: true,
        reliabilityScore: true,
        dynamicsMetrics: true,
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
    console.error("Signup error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
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
    console.error("Signup error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};
// PATCH /users/profile - Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, githubUsername } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(githubUsername && { githubUsername }),
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
    console.error("Signup error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};
