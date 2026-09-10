import express from "express";
import {
  clerkWebhook,
  updateActivity,
  registerStudent,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/webhook", clerkWebhook);
router.post("/activity", updateActivity);
router.post("/register", registerStudent);

export default router;
