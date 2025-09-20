import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.js";
import podRoutes from "./routes/podRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/pods", podRoutes);

app.get("/", (req, res) => {
  res.json({ message: "CodePods backend running ✅" });
});

app.listen(5000, () => console.log("Server running on port 5000"));
