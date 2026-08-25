import "dotenv/config";
// env must be imported first so all subsequent imports can rely on validated env values
import { env } from "./config/env.js";

import express, { type Express } from "express";
import cors from "cors";

import { requestLogger } from "./middleware/request-logger.js";
import { rateLimiter } from "./middleware/rate-limiter.js";
import { errorHandler } from "./middleware/error-handler.js";

import { authRouter } from "./modules/auth/auth.routes.js";
import { workspacesRouter } from "./modules/workspaces/workspaces.routes.js";
import { pagesRouter } from "./modules/pages/pages.routes.js";
import { blocksRouter } from "./modules/blocks/blocks.routes.js";

export function createApp(): Express {
  const app = express();

  // ── Security & parsing ───────────────────────────────────────────────────────
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true, // required for httpOnly cookie (refresh token)
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  // ── Global middleware ─────────────────────────────────────────────────────────
  app.use(requestLogger);
  app.use(rateLimiter({ limit: 200, windowMs: 60_000 }));

  // ── Routes ────────────────────────────────────────────────────────────────────
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/workspaces", workspacesRouter);
  app.use("/api/pages", pagesRouter);
  app.use("/api/blocks", blocksRouter);

  // ── 404 handler ───────────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Route not found" },
    });
  });

  // ── Centralized error handler (must be last) ──────────────────────────────────
  app.use(errorHandler);

  return app;
}

export const app = createApp();
