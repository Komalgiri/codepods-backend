import express from "express";
import { createPod } from "../controllers/podController.js";

const router = express.Router();

router.post("/", createPod);

export default router;
