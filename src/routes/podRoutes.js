import express from "express";

const router = express.Router();

// Example route
router.get("/", (req, res) => {
  res.json({ message: "Pods API working 🚀" });
});

export default router;
