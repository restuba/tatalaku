import { Router } from "express";
import { authController } from "./auth.controller.js";

export const authRouter = Router();

// TODO: add POST /register, POST /login, POST /refresh, POST /logout, GET /me
authRouter.get("/health", (req, res) => authController.healthCheck(req, res));
