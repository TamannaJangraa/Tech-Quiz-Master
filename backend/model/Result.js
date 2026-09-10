import express from "express";

import {
  startQuizAttempt,
  createMyResult,
  getMyResults,
  getLeaderboard,
} from "../controllers/resultController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

// Start a quiz attempt
router.post(
  "/start-attempt",
  protect,
  startQuizAttempt
);

// Submit quiz result
router.post(
  "/save-result",
  protect,
  createMyResult
);

// My results
router.get(
  "/my-results",
  protect,
  getMyResults
);

// Leaderboard
router.get(
  "/leaderboard",
  protect,
  getLeaderboard
);

export default router;