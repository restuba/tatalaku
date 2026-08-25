import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";
import { env } from "../config/env.js";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code ?? "ERROR",
        message: err.message,
      },
    });
    return;
  }

  // Unexpected / unhandled error — log internally, never leak stack to client
  console.error("[Unhandled Error]", err);

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: env.NODE_ENV === "production" ? "An unexpected error occurred" : err.message,
    },
  });
}
