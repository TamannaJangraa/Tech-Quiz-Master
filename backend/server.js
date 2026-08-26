import express from "express";
import cors from "cors";
import "dotenv/config";

import { clerkMiddleware } from "@clerk/express";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";

import webhookRoutes from "./routes/User.js";
import adminRoutes from "./routes/admin.js";
import resultRoutes from "./routes/result.js";

const app = express();
const PORT = process.env.PORT || 8080;

const getDBErrorDetails = (err) => {
  const details = {
    name: err?.name || "UnknownError",
    message: err?.message || "No message",
    code: err?.code || null,
    kind: err?.kind || null,
    value: err?.value ? String(err.value).slice(0, 50) : null,
  };
  if (err?.reason) {
    details.reason = String(err.reason).slice(0, 200);
  }
  if (err?.errors) {
    details.errors = Object.keys(err.errors).map(k => `${k}: ${err.errors[k]?.message}`).join("; ");
  }
  return JSON.stringify(details);
};

const ensureDBConnection = async (req, res, next) => {
  const startTime = Date.now();
  try {
    if (mongoose.connection.readyState === 1) {
      next();
      return;
    }

    const stateMap = ["disconnected", "connecting", "connected", "disconnecting"];
    const currentState = stateMap[mongoose.connection.readyState] || `unknown(${mongoose.connection.readyState})`;
    console.log(`DB: Middleware triggered - state=${currentState}, path=${req.path}`);

    await connectDB();

    if (mongoose.connection.readyState !== 1) {
      throw new Error(`DB connect succeeded but state is still ${mongoose.connection.readyState}`);
    }

    console.log(`DB: Ready after ${Date.now() - startTime}ms for ${req.path}`);
    next();
  } catch (err) {
    const elapsed = Date.now() - startTime;
    console.error(`DB: FAILED after ${elapsed}ms for ${req.method} ${req.path}`);
    console.error(`DB: Error Details: ${getDBErrorDetails(err)}`);

    let userMessage = "Database connection failed. Please try again in a moment.";
    const errMsg = (err?.message || "").toLowerCase();

    if (errMsg.includes("mongodb_uri") || errMsg.includes("environment variable")) {
      userMessage = "Database is not configured. MONGODB_URI is missing in server settings.";
    } else if (errMsg.includes("serverserverselection") || errMsg.includes("connection timed out") || errMsg.includes("could not connect")) {
      userMessage = "Database unreachable. Check MongoDB Atlas network access (whitelist 0.0.0.0/0 for Vercel) or verify MONGODB_URI.";
    } else if (errMsg.includes("authentication") || errMsg.includes("auth failed") || errMsg.includes("bad auth")) {
      userMessage = "Database credentials invalid. Check username/password in MONGODB_URI.";
    }

    return res.status(500).json({
      success: false,
      message: userMessage,
    });
  }
};

app.use(cors());

app.use((req, res, next) => {
  console.log(`REQ: ${req.method} ${req.originalUrl}`);
  next();
});

app.use(ensureDBConnection);

app.use("/api/users", webhookRoutes);

app.use(clerkMiddleware());
app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/results", resultRoutes);

app.get("/", (req, res) => {
  const stateMap = ["DISCONNECTED", "CONNECTING", "CONNECTED", "DISCONNECTING"];
  const dbState = stateMap[mongoose.connection.readyState] || "UNKNOWN";
  res.send({
    status: "API WORKING",
    database: dbState,
    mongodbUriSet: !!process.env.MONGODB_URI,
    clerkKeySet: !!process.env.CLERK_SECRET_KEY,
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  console.log(`404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error(`UNHANDLED ERROR on ${req.method} ${req.originalUrl}:`, err);
  res.status(500).json({
    success: false,
    message: "Unexpected server error",
  });
});

if (process.env.NODE_ENV !== "production") {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Failed to start local server:", err);
      process.exit(1);
    });
}

export default app;