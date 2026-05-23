import mongoose from "mongoose";

let isConnected = false;

export function hasDatabase(): boolean {
  const dbUrl = process.env.MONGODB_URI ?? process.env.DATABASE_URL ?? "";
  return Boolean(dbUrl) && (dbUrl.startsWith("mongodb://") || dbUrl.startsWith("mongodb+srv://"));
}

export async function connectDatabase() {
  if (isConnected) return;
  if (!hasDatabase()) {
    console.warn("[stackwise] MongoDB URI / Database URL not set — skipping DB connection");
    return;
  }
  try {
    const dbUrl = process.env.MONGODB_URI ?? process.env.DATABASE_URL ?? "";
    await mongoose.connect(dbUrl);
    isConnected = true;
    console.log("[stackwise] Connected to MongoDB");
  } catch (err) {
    console.error("[stackwise] MongoDB connection error:", err);
    throw err;
  }
}

