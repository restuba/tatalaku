import mongoose from "mongoose";
import { env } from "../config/env.js";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3_000;

async function connectWithRetry(attempt = 1): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      // Connection pooling: keep at most 10 connections open
      maxPoolSize: 10,
      // How long to wait for a connection from the pool (ms)
      serverSelectionTimeoutMS: 5_000,
      socketTimeoutMS: 45_000,
    });
    console.log("✅ MongoDB connected");
  } catch {
    if (attempt >= MAX_RETRIES) {
      console.error(`❌ MongoDB connection failed after ${MAX_RETRIES} attempts. Shutting down.`);
      process.exit(1);
    }

    console.warn(
      `⚠️  MongoDB connection attempt ${attempt} failed. Retrying in ${RETRY_DELAY_MS / 1000}s...`,
    );
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    await connectWithRetry(attempt + 1);
  }
}

export async function connectDB(): Promise<void> {
  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  MongoDB disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("🔄 MongoDB reconnected");
  });

  await connectWithRetry();
}

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
  console.log("MongoDB connection closed");
}
