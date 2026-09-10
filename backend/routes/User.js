import express from "express";
import {
  clerkWebhook,
  updateActivity,
  registerStudent,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/webhook", clerkWebhook);
router.post("/activity", protect, updateActivity);
router.post("/register", protect, registerStudent);

export default router;
