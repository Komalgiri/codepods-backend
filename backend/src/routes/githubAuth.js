import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Step 1: Redirect user to GitHub for login
router.get("/login", (req, res) => {
  const { token } = req.query; // If token is provided, we are linking an existing account
  const redirect_uri = "https://github.com/login/oauth/authorize";
  const client_id = process.env.GITHUB_CLIENT_ID;
  const scope = "read:user user:email";

  // Use 'state' to pass the token back to our callback
  const state = token || "";

  res.redirect(`${redirect_uri}?client_id=${client_id}&scope=${scope}&state=${state}`);
});

// Step 2: GitHub redirects back here with ?code=XXXX
router.get("/callback", async (req, res) => {
  const { code, state: token } = req.query;

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenResponse.data.access_token;

    // Fetch user info from GitHub API
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const { id, login } = userResponse.data;
    const githubId = String(id);

    let user;

    // A. Check if we are LINKING to an existing logged-in account
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Check if this GitHub ID is ALREADY linked to a DIFFERENT account
        const existingLinkedUser = await prisma.user.findUnique({
          where: { githubId }
        });

        if (existingLinkedUser && existingLinkedUser.id !== userId) {
          // CONFLICT: This GitHub is already tied to another account (the one with the pods!)
          // Strategy: In this specific developer case, we'll let them log into the pod account
          // but for general use, we should probably warn.
          // For now, let's just log them into the existing linked user so they see their pods.
          user = existingLinkedUser;
        } else {
          // Link it to the current account
          user = await prisma.user.update({
            where: { id: userId },
            data: {
              githubId,
              githubUsername: login,
              githubToken: accessToken,
              name: user.name || login // Only update name if it was empty
            }
          });
        }
      } catch (err) {
        console.error("Invalid token in state, falling back to normal login", err);
      }
    }

    // B. If not linking or linking failed, do normal login/creation
    if (!user) {
      user = await prisma.user.findUnique({ where: { githubId } });

      if (!user) {
        // Create new user if not found
        user = await prisma.user.create({
          data: {
            githubId,
            githubUsername: login,
            name: login,
            githubToken: accessToken,
          },
        });
      } else {
        // Update token if user already exists
        user = await prisma.user.update({
          where: { githubId },
          data: {
            githubToken: accessToken,
            githubUsername: login // Ensure username is updated
          },
        });
      }
    }

    // Generate JWT (same as normal login)
    const jwtToken = jwt.sign(
      { id: user.id, githubId: user.githubId, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send JWT back to frontend
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${jwtToken}`);
  } catch (error) {
    console.error("GitHub OAuth Error:", error.response?.data || error.message);
    res.status(500).json({ error: "GitHub OAuth failed" });
  }
});

export default router;
