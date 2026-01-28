import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { encrypt } from "../utils/encryption.js";

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

    const { id, login, name: githubName, email: githubPublicEmail } = userResponse.data;
    const githubId = String(id);

    // Also fetch private emails if needed, to match by email
    let primaryEmail = githubPublicEmail;
    if (!primaryEmail) {
      try {
        const emailsResponse = await axios.get("https://api.github.com/user/emails", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const primary = emailsResponse.data.find(e => e.primary && e.verified);
        if (primary) primaryEmail = primary.email;
      } catch (e) {
        console.error("Failed to fetch GitHub emails:", e.message);
      }
    }

    let user;

    // A. Check if we are LINKING to an existing logged-in account
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Fetch current user details
        const currentUser = await prisma.user.findUnique({ where: { id: userId } });

        if (!currentUser) {
          throw new Error("User from token not found");
        }

        // Check if this GitHub ID is ALREADY linked to a DIFFERENT account
        const existingLinkedUser = await prisma.user.findUnique({
          where: { githubId }
        });

        if (existingLinkedUser && existingLinkedUser.id !== userId) {
          // CONFLICT: This GitHub is already tied to another account (maybe created via GH login)
          // We'll proceed with the existing linked account to prevent logic forks
          user = existingLinkedUser;
          // Optionally merge? For now, we just switch to the account that already has the GitHub ID
        } else {
          // Link it to the current account
          // 🔐 Encrypt GitHub token before storing
          user = await prisma.user.update({
            where: { id: userId },
            data: {
              githubId,
              githubUsername: login,
              githubToken: encrypt(accessToken),
              githubTokenValid: true,
              name: currentUser.name || githubName || login // Use existing name, or GitHub name, or login
            }
          });
        }
      } catch (err) {
        console.error("Invalid token or user in state, falling back to normal login", err.message);
      }
    }

    // B. Match by Email if not found via token/linking (Prevents duplicate profiles)
    if (!user && primaryEmail) {
      const userByEmail = await prisma.user.findUnique({ where: { email: primaryEmail } });
      if (userByEmail) {
        console.log(`[AUTH] Found existing user by email ${primaryEmail}. Linking GitHub...`);
        // 🔐 Encrypt GitHub token before storing
        user = await prisma.user.update({
          where: { id: userByEmail.id },
          data: {
            githubId,
            githubUsername: login,
            githubToken: encrypt(accessToken),
            githubTokenValid: true,
            // Don't overwrite existing name unless it's empty
            name: userByEmail.name || githubName || login
          }
        });
      }
    }

    // C. If not linking or matching failed, do normal logic via GitHub ID
    if (!user) {
      user = await prisma.user.findUnique({ where: { githubId } });

      if (!user) {
        // 🔐 Create new user with encrypted GitHub token
        user = await prisma.user.create({
          data: {
            githubId,
            githubUsername: login,
            name: githubName || login,
            email: primaryEmail,
            githubToken: encrypt(accessToken),
            githubTokenValid: true,
          },
        });
      } else {
        // 🔐 Update with encrypted token if user already exists
        user = await prisma.user.update({
          where: { githubId },
          data: {
            githubToken: encrypt(accessToken),
            githubTokenValid: true,
            githubUsername: login,
            email: user.email || primaryEmail // Update email if missing
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
