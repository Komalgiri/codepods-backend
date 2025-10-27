import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.js";
import podRoutes from "./routes/podRoutes.js";
import githubAuth from "./routes/githubAuth.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Allowed frontend origins
const allowedOrigins = [
  "http://localhost:3000",                      // local frontend (dev)
  "https://your-frontend-name.vercel.app",      // replace with actual deployed frontend URL
];

// ✅ CORS setup
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // enable if using cookies or GitHub OAuth session
  })
);

app.use(express.json());

// ✅ Routes
app.use("/api/users", userRoutes);
app.use("/api/pods", podRoutes);
app.use("/api/auth/github", githubAuth);

// ✅ Health check route
app.get("/", (req, res) => {
  res.json({ message: "CodePods backend running ✅" });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
