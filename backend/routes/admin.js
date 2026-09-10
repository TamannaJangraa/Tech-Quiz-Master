import express from "express";

import {
  getStats,
  getDashboardDetails,
} from "../controllers/userController.js";

import {
  deleteQuiz,
  uploadQuiz,
  getAllQuizzes,
  updateQuiz,
} from "../controllers/adminController.js";

import {
  protect,
  isAdmin,
} from "../middleware/auth.js";

const router = express.Router();

// ========================================
// ADMIN ROUTES
// ========================================

router.post(
  "/upload-quiz",
  protect,
  isAdmin,
  uploadQuiz
);

router.get(
  "/stats",
  protect,
  isAdmin,
  getStats
);

router.get(
  "/details",
  protect,
  isAdmin,
  getDashboardDetails
);

router.get(
  "/quizzes",
  protect,
  isAdmin,
  getAllQuizzes
);

router.put(
  "/quiz/:id",
  protect,
  isAdmin,
  updateQuiz
);

router.delete(
  "/quiz/:id",
  protect,
  isAdmin,
  deleteQuiz
);

// ========================================
// PUBLIC / USER QUIZ ROUTE
// ========================================

router.get(
  "/public-quizzes",
  protect,
  getAllQuizzes
);

export default router;