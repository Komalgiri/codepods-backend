import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";

import userRoutes from "./routes/userRoutes.js";
import podRoutes from "./routes/podRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import rewardRoutes from "./routes/rewardRoutes.js";
import githubAuth from "./routes/githubAuth.js";
import githubRoutes from "./routes/githubRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Security: Helmet for HTTP headers protection
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API-only server
  crossOriginEmbedderPolicy: false,
}));

// Allowed frontend origins (environment-based for production)
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL || "https://codepod-six.vercel.app"]
  : [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "https://codepod-six.vercel.app",
  ];

// CORS setup
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log(" Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // enable if using cookies or GitHub OAuth session
  })
);

app.use(express.json());

// Security: Rate limiting for all API routes
app.use("/api/", apiLimiter);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/pods", podRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/auth/github", githubAuth);
app.use("/api/github", githubRoutes);
app.use("/api/ai", aiRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "CodePods backend running ✅" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
