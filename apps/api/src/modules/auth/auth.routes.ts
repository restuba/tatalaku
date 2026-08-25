import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validate } from "../../middleware/validate.js";
import { authGuard } from "../../middleware/auth-guard.js";
import { registerSchema, loginSchema } from "./auth.validation.js";

export const authRouter = Router();

// POST /api/auth/register
authRouter.post("/register", validate(registerSchema), (req, res, next) =>
  authController.register(req, res, next),
);

// POST /api/auth/login
authRouter.post("/login", validate(loginSchema), (req, res, next) =>
  authController.login(req, res, next),
);

// POST /api/auth/refresh
authRouter.post("/refresh", (req, res, next) => authController.refresh(req, res, next));

// POST /api/auth/logout
authRouter.post("/logout", (req, res) => authController.logout(req, res));

// GET /api/auth/me  (protected)
authRouter.get("/me", authGuard, (req, res, next) => authController.getMe(req, res, next));
