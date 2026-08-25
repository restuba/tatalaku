import type { JwtPayload } from "jsonwebtoken";

// Augment Express Request to include authenticated user context
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface AccessTokenPayload extends JwtPayload {
  id: string;
  email: string;
}

export interface RefreshTokenPayload extends JwtPayload {
  id: string;
}
