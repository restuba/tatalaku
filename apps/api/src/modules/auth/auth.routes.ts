import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validate } from "../../middleware/validate.js";
import { authGuard } from "../../middleware/auth-guard.js";
import { registerSchema, loginSchema } from "./auth.validation.js";
import { rateLimiter } from "../../middleware/rate-limiter.js";

export const authRouter = Router();

const authLimiter = rateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 }); // 5 requests per 15 minutes

// POST /api/auth/register
authRouter.post("/register", authLimiter, validate(registerSchema), (req, res, next) =>
  authController.register(req, res, next),
);

// POST /api/auth/login
authRouter.post("/login", authLimiter, validate(loginSchema), (req, res, next) =>
  authController.login(req, res, next),
);

// POST /api/auth/refresh
authRouter.post("/refresh", (req, res, next) => authController.refresh(req, res, next));

// POST /api/auth/logout  (protected)
authRouter.post("/logout", authGuard, (req, res, next) => authController.logout(req, res, next));

// GET /api/auth/me  (protected)
authRouter.get("/me", authGuard, (req, res, next) => authController.getMe(req, res, next));
