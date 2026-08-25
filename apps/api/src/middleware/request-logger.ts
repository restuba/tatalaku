import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  if (env.NODE_ENV === "test") {
    next();
    return;
  }

  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 500 ? "\x1b[31m" : status >= 400 ? "\x1b[33m" : "\x1b[32m";
    const reset = "\x1b[0m";

    console.log(`${color}${req.method} ${req.path} ${status} — ${duration}ms${reset}`);
  });

  next();
}
