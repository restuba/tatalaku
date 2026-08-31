import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import type { RegisterInput, LoginInput } from "./auth.validation.js";
import { UserModel } from "./auth.model.js";
import { RefreshTokenModel } from "./refresh-token.model.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";
import { ConflictError, NotFoundError, UnauthorizedError } from "../../utils/errors.js";
import type { User } from "@tatalaku/shared";

const SALT_ROUNDS = 12;
/** Refresh token TTL — must match JWT_REFRESH_EXPIRES_IN (7 days) */
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Strip passwordHash before returning user data to client */
function toUserResponse(doc: {
  id: unknown;
  email: string;
  name: string;
  avatarUrl?: string | null | undefined;
  createdAt: Date | string;
}): User {
  return {
    id: doc.id as string,
    email: doc.email,
    name: doc.name,
    avatarUrl: doc.avatarUrl ?? null,
    createdAt: doc.createdAt,
  };
}

/** Hash a token with SHA-256 for safe storage (no need for slow hash — tokens are already high-entropy) */
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async register(input: RegisterInput): Promise<{ user: User; tokens: AuthTokens }> {
    const existing = await UserModel.findOne({ email: input.email });
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await UserModel.create({
      email: input.email,
      name: input.name,
      passwordHash,
    });

    const tokens = await this.generateTokens(user.id as string, user.email);
    return { user: toUserResponse(user), tokens };
  }

  async login(input: LoginInput): Promise<{ user: User; tokens: AuthTokens }> {
    // Explicitly select passwordHash since it's excluded by default (select: false)
    const user = await UserModel.findOne({ email: input.email }).select("+passwordHash");
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const tokens = await this.generateTokens(user.id as string, user.email);
    return { user: toUserResponse(user), tokens };
  }

  /**
   * Rotate refresh token: verify the old token, revoke it, and issue a new pair.
   *
   * Security model (refresh token rotation with family-based revocation):
   * - Each login creates a new "token family" (random UUID).
   * - On refresh, the used token is consumed (deleted from DB).
   * - If a previously-consumed token is replayed (stolen token), the entire
   *   family is revoked, forcing a re-login on all devices using that family.
   */
  async refreshToken(token: string): Promise<AuthTokens> {
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const tokenHash = hashToken(token);
    const storedToken = await RefreshTokenModel.findOne({ tokenHash });

    if (!storedToken) {
      // Token was already consumed or never existed.
      // This could be a replay attack — revoke the entire family if the JWT
      // payload contains a valid user, as a precaution.
      // Since we cannot know the family from a consumed token, revoke ALL
      // tokens for this user to be safe.
      await RefreshTokenModel.deleteMany({ userId: payload.id });
      throw new UnauthorizedError("Refresh token has already been used — all sessions revoked");
    }

    // Token is valid — consume it (one-time use)
    await RefreshTokenModel.deleteOne({ _id: storedToken._id });

    const user = await UserModel.findById(payload.id);
    if (!user) {
      // User was deleted — clean up family
      await RefreshTokenModel.deleteMany({ family: storedToken.family });
      throw new NotFoundError("User");
    }

    // Issue new tokens in the same family
    return this.generateTokens(user.id as string, user.email, storedToken.family);
  }

  /**
   * Revoke all refresh tokens for a user (used on logout)
   */
  async revokeAllTokens(userId: string): Promise<void> {
    await RefreshTokenModel.deleteMany({ userId });
  }

  async getMe(userId: string): Promise<User> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError("User");
    }
    return toUserResponse(user);
  }

  /**
   * Generate access + refresh tokens and persist the refresh token hash in DB.
   * @param family  Reuse an existing family (on rotation) or create a new one (on login/register).
   */
  private async generateTokens(
    userId: string,
    email: string,
    family?: string,
  ): Promise<AuthTokens> {
    const accessToken = signAccessToken({ id: userId, email });
    const refreshToken = signRefreshToken({ id: userId });

    const tokenFamily = family ?? crypto.randomUUID();

    await RefreshTokenModel.create({
      tokenHash: hashToken(refreshToken),
      userId,
      family: tokenFamily,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
