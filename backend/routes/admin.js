import express from "express";
import { getStats } from "../controllers/userController.js";
import {
  deleteQuiz,
  uploadQuiz,
  getAllQuizzes,
} from "../controllers/adminController.js";
import { protect, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Admin routes
router.post("/upload-quiz", protect, isAdmin, uploadQuiz);
router.get("/stats", protect, isAdmin, getStats);
router.get("/quizzes", protect, isAdmin, getAllQuizzes);
router.delete("/quiz/:id", protect, isAdmin, deleteQuiz);

// Public/User quiz route
router.get("/public-quizzes", protect, getAllQuizzes);

export default router;