import type { Request, Response, NextFunction } from "express";

// Simple in-memory rate limiter (per-IP).
// Replace with a Redis-backed solution (e.g., rate-limiter-flexible) for multi-instance deployments.

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimiterOptions {
  /** Maximum requests per window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

export function rateLimiter(options: RateLimiterOptions = { limit: 100, windowMs: 60_000 }) {
  const { limit, windowMs } = options;
  const store = new Map<string, RateLimitEntry>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip =
      (req.headers["x-forwarded-for"] as string | undefined) ??
      req.socket.remoteAddress ??
      "unknown";
    const now = Date.now();

    const entry = store.get(ip);

    if (!entry || now > entry.resetAt) {
      store.set(ip, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (entry.count >= limit) {
      const retryAfterSecs = Math.ceil((entry.resetAt - now) / 1000);
      res.set("Retry-After", String(retryAfterSecs));
      res.status(429).json({
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: `Too many requests. Retry after ${retryAfterSecs}s.`,
        },
      });
      return;
    }

    entry.count++;
    next();
  };
}
