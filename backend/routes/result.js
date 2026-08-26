import express from "express";
import {
  createMyResult,
  getMyResults,
  getLeaderboard,
} from "../controllers/resultController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

// Create a result
router.post("/save-result", protect, createMyResult);

// Get results for logged-in user
router.get("/my-results", protect, getMyResults);

// Get leaderboard
router.get("/leaderboard", protect, getLeaderboard);

export default router;