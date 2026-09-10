import express from "express";

import {
  startQuizAttempt,
  createMyResult,
  getMyResults,
  getLeaderboard,
} from "../controllers/resultController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

// ========================================
// START QUIZ ATTEMPT
// ========================================

router.post(
  "/start-attempt",
  protect,
  startQuizAttempt
);

// ========================================
// SUBMIT QUIZ RESULT
// ========================================

router.post(
  "/save-result",
  protect,
  createMyResult
);

// ========================================
// GET MY RESULTS
// ========================================

router.get(
  "/my-results",
  protect,
  getMyResults
);

// ========================================
// GET LEADERBOARD
// ========================================

router.get(
  "/leaderboard",
  protect,
  getLeaderboard
);

export default router;