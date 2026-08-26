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

app.use("/api/admin", adminRoutes);
app.use("/api/results", resultRoutes);

app.get("/", (req, res) => {
  res.send("API WORKING");
});

// Start server only AFTER MongoDB connects
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();