import "dotenv/config";
import { env } from "./config/env.js";
import { app } from "./app.js";
import { connectDB } from "./db/connection.js";

async function bootstrap(): Promise<void> {
  // Connect to MongoDB before accepting any requests
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Server is running on port ${env.PORT} (${env.NODE_ENV})`);
  });

  // Graceful shutdown on SIGTERM / SIGINT
  const shutdown = (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });

    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
      console.error("Forced shutdown after timeout.");
      process.exit(1);
    }, 10_000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((err: unknown) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
