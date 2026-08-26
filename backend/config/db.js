import mongoose from "mongoose";

let cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export const connectDB = async () => {
  if (cached.conn) {
    console.log("DB: Using cached connection");
    return cached.conn;
  }

  if (!process.env.MONGODB_URI) {
    const msg = "DB ERROR: MONGODB_URI environment variable is NOT SET. Please add it in Vercel Environment Variables.";
    console.error(msg);
    throw new Error(msg);
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    };

    console.log("DB: Connecting to MongoDB...");
    console.log("DB: URI starts with:", process.env.MONGODB_URI.substring(0, 20) + "...");

    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log("DB: MongoDB CONNECTED successfully");
        return mongooseInstance;
      })
      .catch((err) => {
        console.error("DB: Connection FAILED - Full error:");
        console.error("  Name:", err.name);
        console.error("  Message:", err.message);
        if (err.reason) {
          console.error("  Reason:", err.reason);
        }
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
};