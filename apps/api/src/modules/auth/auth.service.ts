import bcrypt from "bcryptjs";
import type { RegisterInput, LoginInput } from "./auth.validation.js";
import { UserModel } from "./auth.model.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";
import { ConflictError, NotFoundError, UnauthorizedError } from "../../utils/errors.js";
import type { User } from "@tatalaku/shared";

const SALT_ROUNDS = 12;

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

    const tokens = this.generateTokens(user.id as string, user.email);
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

    const tokens = this.generateTokens(user.id as string, user.email);
    return { user: toUserResponse(user), tokens };
  }

  async refreshToken(token: string): Promise<AuthTokens> {
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const user = await UserModel.findById(payload.id);
    if (!user) {
      throw new NotFoundError("User");
    }

    return this.generateTokens(user.id as string, user.email);
  }

  async getMe(userId: string): Promise<User> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError("User");
    }
    return toUserResponse(user);
  }

  private generateTokens(userId: string, email: string): AuthTokens {
    return {
      accessToken: signAccessToken({ id: userId, email }),
      refreshToken: signRefreshToken({ id: userId }),
    };
  }
}

export const authService = new AuthService();
