import { describe, it, expect, vi, beforeEach } from "vitest";
import { workspacesService } from "./workspaces.service.js";
import { WorkspaceModel } from "./workspaces.model.js";
import { PageModel } from "../pages/pages.model.js";
import { ForbiddenError, NotFoundError } from "../../utils/errors.js";

vi.mock("./workspaces.model.js");
vi.mock("../pages/pages.model.js");

describe("WorkspacesService", () => {
  const mockUserId = "user-1";
  const mockWorkspaceId = "workspace-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getById", () => {
    it("should return workspace if user is owner", async () => {
      const mockWorkspace = {
        _id: mockWorkspaceId,
        name: "Test WS",
        ownerId: mockUserId,
        memberIds: [],
        createdAt: new Date(),
      };
      vi.mocked(WorkspaceModel.findById).mockResolvedValueOnce(mockWorkspace as never);

      const result = await workspacesService.getById(mockWorkspaceId, mockUserId);
      expect(result.id).toBe(mockWorkspaceId);
    });

    it("should return workspace if user is member", async () => {
      const mockWorkspace = {
        _id: mockWorkspaceId,
        name: "Test WS",
        ownerId: "other-user",
        memberIds: [mockUserId],
        createdAt: new Date(),
      };
      vi.mocked(WorkspaceModel.findById).mockResolvedValueOnce(mockWorkspace as never);

      const result = await workspacesService.getById(mockWorkspaceId, mockUserId);
      expect(result.id).toBe(mockWorkspaceId);
    });

    it("should throw NotFoundError if workspace does not exist", async () => {
      vi.mocked(WorkspaceModel.findById).mockResolvedValueOnce(null);

      await expect(workspacesService.getById(mockWorkspaceId, mockUserId)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("should throw ForbiddenError if user is not owner or member", async () => {
      const mockWorkspace = {
        _id: mockWorkspaceId,
        ownerId: "other-user",
        memberIds: ["another-user"],
      };
      vi.mocked(WorkspaceModel.findById).mockResolvedValueOnce(mockWorkspace as never);

      await expect(workspacesService.getById(mockWorkspaceId, mockUserId)).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  describe("create", () => {
    it("should successfully create a workspace", async () => {
      const input = { name: "New Workspace" };
      const createdDoc = {
        _id: "new-ws-id",
        ...input,
        ownerId: mockUserId,
        memberIds: [],
        createdAt: new Date(),
      };
      vi.mocked(WorkspaceModel.create).mockResolvedValueOnce(createdDoc as never);

      const result = await workspacesService.create(mockUserId, input);
      expect(result.id).toBe("new-ws-id");
      expect(result.name).toBe("New Workspace");
      expect(WorkspaceModel.create).toHaveBeenCalledWith({
        name: input.name,
        ownerId: mockUserId,
        memberIds: [],
      });
    });
  });

  describe("update", () => {
    it("should update workspace if user is owner", async () => {
      const mockWorkspace = {
        _id: mockWorkspaceId,
        ownerId: mockUserId,
        name: "Old Name",
        save: vi.fn().mockResolvedValueOnce(true),
      };
      vi.mocked(WorkspaceModel.findById).mockResolvedValueOnce(mockWorkspace as never);

      await workspacesService.update(mockWorkspaceId, mockUserId, { name: "New Name" });
      expect(mockWorkspace.name).toBe("New Name");
      expect(mockWorkspace.save).toHaveBeenCalled();
    });

    it("should throw ForbiddenError if user is not owner", async () => {
      const mockWorkspace = {
        _id: mockWorkspaceId,
        ownerId: "other-user", // user is just member, not owner
        memberIds: [mockUserId],
      };
      vi.mocked(WorkspaceModel.findById).mockResolvedValueOnce(mockWorkspace as never);

      await expect(
        workspacesService.update(mockWorkspaceId, mockUserId, { name: "New Name" }),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("delete", () => {
    it("should delete workspace and cascade archive pages if user is owner", async () => {
      const mockWorkspace = {
        _id: mockWorkspaceId,
        ownerId: mockUserId,
      };
      vi.mocked(WorkspaceModel.findById).mockResolvedValueOnce(mockWorkspace as never);
      vi.mocked(PageModel.updateMany).mockResolvedValueOnce({} as never);
      vi.mocked(WorkspaceModel.findByIdAndDelete).mockResolvedValueOnce({} as never);

      await workspacesService.delete(mockWorkspaceId, mockUserId);
      expect(PageModel.updateMany).toHaveBeenCalledWith(
        { workspaceId: mockWorkspaceId },
        { $set: { isArchived: true } },
      );
      expect(WorkspaceModel.findByIdAndDelete).toHaveBeenCalledWith(mockWorkspaceId);
    });

    it("should throw ForbiddenError if user is not owner", async () => {
      const mockWorkspace = {
        _id: mockWorkspaceId,
        ownerId: "other-user",
      };
      vi.mocked(WorkspaceModel.findById).mockResolvedValueOnce(mockWorkspace as never);

      await expect(workspacesService.delete(mockWorkspaceId, mockUserId)).rejects.toThrow(
        ForbiddenError,
      );
    });
  });
});
