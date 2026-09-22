import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service.js";
import { env } from "../../config/env.js";

const REFRESH_TOKEN_COOKIE = "refreshToken";

const isProduction = env.NODE_ENV === "production";

// Web and API live on different sites in production
// (tatalaku.up.railway.app vs tatalaku-services.up.railway.app), so the refresh
// token cookie must be sent on cross-site requests. That requires SameSite=None,
// which browsers only honor together with Secure. In development we keep Lax so
// the cookie works over http://localhost.
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: "/",
};

// clearCookie only removes the cookie when secure/sameSite/path match the
// attributes used when it was set, so keep these in sync with cookieOptions.
const clearCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
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
      // If refresh fails (e.g., token expired, user deleted from DB), clear the invalid cookie
      // so the client's middleware doesn't get stuck in an infinite redirect loop.
      res.clearCookie(REFRESH_TOKEN_COOKIE, clearCookieOptions);
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Revoke all stored refresh tokens for this user
      if (req.user) {
        await authService.revokeAllTokens(req.user.id);
      }
      res.clearCookie(REFRESH_TOKEN_COOKIE, clearCookieOptions);
      res.status(200).json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
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
