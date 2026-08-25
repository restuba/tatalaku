import type { Request, Response } from "express";

// Auth controller: parses request and delegates to authService.
// No business logic here.
export class AuthController {
  // TODO: implement register(), login(), refreshToken(), logout(), getMe() handlers
  healthCheck(_req: Request, res: Response): void {
    res.json({ module: "auth", status: "ok" });
  }
}

export const authController = new AuthController();
