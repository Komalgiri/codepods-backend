import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.js";
import podRoutes from "./routes/podRoutes.js";
import githubAuth from "./routes/githubAuth.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/pods", podRoutes);
app.use("/api/auth/github", githubAuth);

app.get("/", (req, res) => {
  res.json({ message: "CodePods backend running ✅" });
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
