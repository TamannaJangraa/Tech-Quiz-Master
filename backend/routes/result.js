import express from "express";
import {
  createMyResult,
  getMyResults,
  getLeaderboard,
} from "../controllers/resultController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/save-result", protect, createMyResult);
router.get("/my-results", protect, getMyResults);
router.get("/leaderboard", protect, getLeaderboard);

export default router;
