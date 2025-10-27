import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Step 1: Redirect user to GitHub for login
router.get("/login", (req, res) => {
  const redirect_uri = "https://github.com/login/oauth/authorize";
  const client_id = process.env.GITHUB_CLIENT_ID;
  const scope = "read:user user:email";
  res.redirect(`${redirect_uri}?client_id=${client_id}&scope=${scope}`);
});

// Step 2: GitHub redirects back here with ?code=XXXX
router.get("/callback", async (req, res) => {
  const code = req.query.code;

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

    const { id, login, avatar_url } = userResponse.data;

    // Find or create user
    let user = await prisma.user.findUnique({ where: { githubId: String(id) } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          githubId: String(id),
          name: login,
          githubToken: accessToken, // plain for now
        },
      });
    }

    // Generate JWT (same as normal login)
    const token = jwt.sign(
      { id: user.id, githubId: user.githubId, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send JWT back
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "GitHub OAuth failed" });
  }
});

export default router;
