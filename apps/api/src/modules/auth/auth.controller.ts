import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service.js";
import { env } from "../../config/env.js";

const REFRESH_TOKEN_COOKIE = "refreshToken";

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: "/",
};

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, tokens } = await authService.register(req.body);
      res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, cookieOptions);
      res.status(201).json({
        success: true,
        data: { user, accessToken: tokens.accessToken },
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, tokens } = await authService.login(req.body);
      res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, cookieOptions);
      res.status(200).json({
        success: true,
        data: { user, accessToken: tokens.accessToken },
      });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies[REFRESH_TOKEN_COOKIE] as string | undefined;
      if (!token) {
        res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "No refresh token provided" },
        });
        return;
      }

      const tokens = await authService.refreshToken(token);
      res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, cookieOptions);
      res.status(200).json({
        success: true,
        data: { accessToken: tokens.accessToken },
      });
    } catch (err) {
      next(err);
    }
  }

  logout(_req: Request, res: Response): void {
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/" });
    res.status(200).json({ success: true, data: null });
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getMe(req.user!.id);
      res.status(200).json({ success: true, data: { user } });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
