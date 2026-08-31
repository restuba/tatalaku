import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "./auth.service.js";
import { UserModel } from "./auth.model.js";
import { RefreshTokenModel } from "./refresh-token.model.js";
import * as jwt from "../../utils/jwt.js";
import bcrypt from "bcryptjs";
import { ConflictError, UnauthorizedError, NotFoundError } from "../../utils/errors.js";

// Mock dependencies
vi.mock("./auth.model.js");
vi.mock("./refresh-token.model.js");
vi.mock("../../utils/jwt.js");
vi.mock("bcryptjs");

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks for token generation (used in most tests)
    vi.mocked(jwt.signAccessToken).mockReturnValue("access-token");
    vi.mocked(jwt.signRefreshToken).mockReturnValue("refresh-token");
    vi.mocked(RefreshTokenModel.create).mockResolvedValue({} as never);
  });

  describe("register", () => {
    it("should throw ConflictError if email already exists", async () => {
      vi.mocked(UserModel.findOne).mockResolvedValueOnce({ _id: "existingId" } as never);

      await expect(
        authService.register({
          email: "test@test.com",
          password: "password123",
          name: "Test User",
        }),
      ).rejects.toThrow(ConflictError);
    });

    it("should hash password, create user, and persist refresh token hash", async () => {
      vi.mocked(UserModel.findOne).mockResolvedValueOnce(null);
      vi.mocked(bcrypt.hash).mockResolvedValueOnce("hashedPassword" as never);
      vi.mocked(UserModel.create).mockResolvedValueOnce({
        id: "newUserId",
        email: "test@test.com",
        name: "Test User",
        createdAt: new Date(),
      } as never);

      const result = await authService.register({
        email: "test@test.com",
        password: "password123",
        name: "Test User",
      });

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 12);
      expect(UserModel.create).toHaveBeenCalledWith({
        email: "test@test.com",
        name: "Test User",
        passwordHash: "hashedPassword",
      });
      expect(RefreshTokenModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "newUserId",
          tokenHash: expect.any(String),
          family: expect.any(String),
          expiresAt: expect.any(Date),
        }),
      );
      expect(result.tokens.accessToken).toBe("access-token");
      expect(result.user.name).toBe("Test User");
    });
  });

  describe("login", () => {
    it("should throw UnauthorizedError if user not found", async () => {
      const mockSelect = vi.fn().mockResolvedValueOnce(null);
      vi.mocked(UserModel.findOne).mockReturnValueOnce({ select: mockSelect } as never);

      await expect(
        authService.login({ email: "test@test.com", password: "password123" }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError if password does not match", async () => {
      const mockUser = { passwordHash: "hashedPassword" };
      const mockSelect = vi.fn().mockResolvedValueOnce(mockUser);
      vi.mocked(UserModel.findOne).mockReturnValueOnce({ select: mockSelect } as never);
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);

      await expect(
        authService.login({ email: "test@test.com", password: "wrongpassword" }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should return tokens and user on successful login", async () => {
      const mockUser = {
        id: "userId",
        email: "test@test.com",
        name: "Test User",
        passwordHash: "hashedPassword",
        createdAt: new Date(),
      };
      const mockSelect = vi.fn().mockResolvedValueOnce(mockUser);
      vi.mocked(UserModel.findOne).mockReturnValueOnce({ select: mockSelect } as never);
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);

      const result = await authService.login({
        email: "test@test.com",
        password: "password123",
      });

      expect(result.tokens.accessToken).toBe("access-token");
      expect(result.user.email).toBe("test@test.com");
      expect(RefreshTokenModel.create).toHaveBeenCalled();
    });
  });

  describe("refreshToken", () => {
    it("should throw UnauthorizedError if JWT is invalid", async () => {
      vi.mocked(jwt.verifyRefreshToken).mockImplementationOnce(() => {
        throw new Error("Invalid");
      });

      await expect(authService.refreshToken("invalid-token")).rejects.toThrow(UnauthorizedError);
    });

    it("should revoke all user tokens and throw if token hash not found in DB (replay attack)", async () => {
      vi.mocked(jwt.verifyRefreshToken).mockReturnValueOnce({ id: "userId" } as never);
      vi.mocked(RefreshTokenModel.findOne).mockResolvedValueOnce(null);
      vi.mocked(RefreshTokenModel.deleteMany).mockResolvedValueOnce({} as never);

      await expect(authService.refreshToken("replayed-token")).rejects.toThrow(UnauthorizedError);
      expect(RefreshTokenModel.deleteMany).toHaveBeenCalledWith({ userId: "userId" });
    });

    it("should throw NotFoundError if user was deleted", async () => {
      vi.mocked(jwt.verifyRefreshToken).mockReturnValueOnce({ id: "userId" } as never);
      vi.mocked(RefreshTokenModel.findOne).mockResolvedValueOnce({
        _id: "tokenDocId",
        family: "family-1",
      } as never);
      vi.mocked(RefreshTokenModel.deleteOne).mockResolvedValueOnce({} as never);
      vi.mocked(UserModel.findById).mockResolvedValueOnce(null);
      vi.mocked(RefreshTokenModel.deleteMany).mockResolvedValueOnce({} as never);

      await expect(authService.refreshToken("valid-token")).rejects.toThrow(NotFoundError);
      expect(RefreshTokenModel.deleteMany).toHaveBeenCalledWith({ family: "family-1" });
    });

    it("should consume token, issue new pair in the same family on success", async () => {
      vi.mocked(jwt.verifyRefreshToken).mockReturnValueOnce({ id: "userId" } as never);
      vi.mocked(RefreshTokenModel.findOne).mockResolvedValueOnce({
        _id: "tokenDocId",
        family: "family-1",
      } as never);
      vi.mocked(RefreshTokenModel.deleteOne).mockResolvedValueOnce({} as never);
      vi.mocked(UserModel.findById).mockResolvedValueOnce({
        id: "userId",
        email: "test@test.com",
      } as never);

      const result = await authService.refreshToken("valid-token");

      expect(RefreshTokenModel.deleteOne).toHaveBeenCalledWith({ _id: "tokenDocId" });
      expect(result.accessToken).toBe("access-token");
      expect(RefreshTokenModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ family: "family-1" }),
      );
    });
  });

  describe("revokeAllTokens", () => {
    it("should delete all refresh tokens for the user", async () => {
      vi.mocked(RefreshTokenModel.deleteMany).mockResolvedValueOnce({} as never);

      await authService.revokeAllTokens("userId");

      expect(RefreshTokenModel.deleteMany).toHaveBeenCalledWith({ userId: "userId" });
    });
  });
});
