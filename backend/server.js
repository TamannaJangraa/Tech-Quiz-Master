import express from "express";
import cors from "cors";
import "dotenv/config";

import { clerkMiddleware } from "@clerk/express";
import { connectDB } from "./config/db.js";

import webhookRoutes from "./routes/User.js";
import adminRoutes from "./routes/admin.js";
import resultRoutes from "./routes/result.js";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

// Webhook route
app.use("/api/users", webhookRoutes);

app.use(clerkMiddleware());
app.use(express.json());

// API routes
app.use("/api/admin", adminRoutes);
app.use("/api/results", resultRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API WORKING");
});

// Connect MongoDB
connectDB()
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });

// Local development only
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Vercel needs the Express app
export default app;