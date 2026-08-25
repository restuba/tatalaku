import { describe, it, expect, vi, beforeEach } from "vitest";
import { blocksService } from "./blocks.service.js";
import { BlockModel } from "./blocks.model.js";
import { PageModel } from "../pages/pages.model.js";
import { WorkspaceModel } from "../workspaces/workspaces.model.js";
import { ForbiddenError, NotFoundError } from "../../utils/errors.js";
import mongoose from "mongoose";

vi.mock("./blocks.model.js");
vi.mock("../pages/pages.model.js");
vi.mock("../workspaces/workspaces.model.js");

describe("BlocksService", () => {
  const mockUserId = "user-1";
  const mockPageId = new mongoose.Types.ObjectId().toString();
  const mockWorkspaceId = "workspace-1";
  const mockBlockId = "block-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Since assertPageAccess is private, we test it implicitly via public methods
  describe("assertPageAccess (implicit via create)", () => {
    it("should throw NotFoundError if page does not exist", async () => {
      vi.mocked(PageModel.findById).mockResolvedValueOnce(null);

      await expect(
        blocksService.create(mockUserId, { pageId: mockPageId, type: "paragraph", order: 1 }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError if workspace does not exist", async () => {
      vi.mocked(PageModel.findById).mockResolvedValueOnce({
        workspaceId: mockWorkspaceId,
      } as never);
      vi.mocked(WorkspaceModel.findById).mockResolvedValueOnce(null);

      await expect(
        blocksService.create(mockUserId, { pageId: mockPageId, type: "paragraph", order: 1 }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError if user has no access", async () => {
      vi.mocked(PageModel.findById).mockResolvedValueOnce({
        workspaceId: mockWorkspaceId,
      } as never);
      vi.mocked(WorkspaceModel.findById).mockResolvedValueOnce({
        ownerId: "other-user",
        memberIds: ["another-user"],
      } as never);

      await expect(
        blocksService.create(mockUserId, { pageId: mockPageId, type: "paragraph", order: 1 }),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("create", () => {
    it("should create a block successfully", async () => {
      vi.mocked(PageModel.findById).mockResolvedValueOnce({
        workspaceId: mockWorkspaceId,
      } as never);
      vi.mocked(WorkspaceModel.findById).mockResolvedValueOnce({
        ownerId: mockUserId,
        memberIds: [],
      } as never);

      const createdBlock = {
        _id: mockBlockId,
        pageId: mockPageId,
        type: "paragraph",
        content: "Hello",
        order: 1,
      };
      vi.mocked(BlockModel.create).mockResolvedValueOnce(createdBlock as never);
      vi.mocked(PageModel.findByIdAndUpdate).mockResolvedValueOnce({} as never);

      const result = await blocksService.create(mockUserId, {
        pageId: mockPageId,
        type: "paragraph",
        content: "Hello",
        order: 1,
      });

      expect(result.id).toBe(mockBlockId);
      expect(BlockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          pageId: mockPageId,
          type: "paragraph",
          content: "Hello",
          order: 1,
        }),
      );
      expect(PageModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update a block successfully", async () => {
      const mockBlock = {
        _id: mockBlockId,
        pageId: mockPageId,
        type: "paragraph",
        content: "Old",
        save: vi.fn().mockResolvedValueOnce(true),
      };
      vi.mocked(BlockModel.findById).mockResolvedValueOnce(mockBlock as never);

      vi.mocked(PageModel.findById).mockResolvedValueOnce({
        workspaceId: mockWorkspaceId,
      } as never);
      vi.mocked(WorkspaceModel.findById).mockResolvedValueOnce({
        ownerId: mockUserId,
        memberIds: [],
      } as never);
      vi.mocked(PageModel.findByIdAndUpdate).mockResolvedValueOnce({} as never);

      await blocksService.update(mockBlockId, mockUserId, { content: "New" });

      expect(mockBlock.content).toBe("New");
      expect(mockBlock.save).toHaveBeenCalled();
    });

    it("should throw NotFoundError if block does not exist", async () => {
      vi.mocked(BlockModel.findById).mockResolvedValueOnce(null);

      await expect(
        blocksService.update(mockBlockId, mockUserId, { content: "New" }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("delete", () => {
    it("should delete a block and its children", async () => {
      const mockBlock = {
        _id: mockBlockId,
        pageId: mockPageId,
      };
      vi.mocked(BlockModel.findById).mockResolvedValueOnce(mockBlock as never);
      vi.mocked(PageModel.findById).mockResolvedValueOnce({
        workspaceId: mockWorkspaceId,
      } as never);
      vi.mocked(WorkspaceModel.findById).mockResolvedValueOnce({
        ownerId: mockUserId,
        memberIds: [],
      } as never);

      vi.mocked(BlockModel.deleteMany).mockResolvedValueOnce({} as never);
      vi.mocked(PageModel.findByIdAndUpdate).mockResolvedValueOnce({} as never);

      await blocksService.delete(mockBlockId, mockUserId);

      expect(BlockModel.deleteMany).toHaveBeenCalledWith({
        $or: [{ _id: mockBlockId }, { parentBlockId: mockBlockId }],
      });
      expect(PageModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });
});
