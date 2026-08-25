import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "./auth.service.js";
import { UserModel } from "./auth.model.js";
import * as jwt from "../../utils/jwt.js";
import bcrypt from "bcryptjs";
import { ConflictError, UnauthorizedError, NotFoundError } from "../../utils/errors.js";

// Mock dependencies
vi.mock("./auth.model.js");
vi.mock("../../utils/jwt.js");
vi.mock("bcryptjs");

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    it("should hash password and create a new user", async () => {
      vi.mocked(UserModel.findOne).mockResolvedValueOnce(null);
      vi.mocked(bcrypt.hash).mockResolvedValueOnce("hashedPassword" as never);
      vi.mocked(UserModel.create).mockResolvedValueOnce({
        id: "newUserId",
        email: "test@test.com",
        name: "Test User",
        createdAt: new Date(),
      } as never);

      vi.mocked(jwt.signAccessToken).mockReturnValue("access-token");
      vi.mocked(jwt.signRefreshToken).mockReturnValue("refresh-token");

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
      vi.mocked(jwt.signAccessToken).mockReturnValue("access-token");
      vi.mocked(jwt.signRefreshToken).mockReturnValue("refresh-token");

      const result = await authService.login({
        email: "test@test.com",
        password: "password123",
      });

      expect(result.tokens.accessToken).toBe("access-token");
      expect(result.user.email).toBe("test@test.com");
    });
  });

  describe("refreshToken", () => {
    it("should throw UnauthorizedError if token is invalid", async () => {
      vi.mocked(jwt.verifyRefreshToken).mockImplementationOnce(() => {
        throw new Error("Invalid");
      });

      await expect(authService.refreshToken("invalid-token")).rejects.toThrow(UnauthorizedError);
    });

    it("should throw NotFoundError if user does not exist", async () => {
      vi.mocked(jwt.verifyRefreshToken).mockReturnValueOnce({ id: "userId" } as never);
      vi.mocked(UserModel.findById).mockResolvedValueOnce(null);

      await expect(authService.refreshToken("valid-token")).rejects.toThrow(NotFoundError);
    });
  });
});
