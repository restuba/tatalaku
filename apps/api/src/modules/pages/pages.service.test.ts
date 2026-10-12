import { describe, it, expect, vi, beforeEach } from "vitest";
import { pagesService } from "./pages.service.js";
import { PageModel } from "./pages.model.js";
import { WorkspaceModel } from "../workspaces/workspaces.model.js";
import { ForbiddenError, NotFoundError, ValidationError } from "../../utils/errors.js";

vi.mock("./pages.model.js");
vi.mock("../workspaces/workspaces.model.js");

describe("PagesService", () => {
  const mockUserId = "user-1";
  const mockWorkspaceId = "workspace-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("assertWorkspaceAccess", () => {
    it("should throw NotFoundError if workspace does not exist", async () => {
      vi.mocked(WorkspaceModel.findById).mockResolvedValueOnce(null);

      await expect(
        pagesService.list(mockUserId, { workspaceId: "invalid", page: 1, limit: 10 }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError if user is not member or owner", async () => {
      vi.mocked(WorkspaceModel.findById).mockResolvedValueOnce({
        ownerId: "other-user",
        memberIds: ["another-user"],
      } as never);

      await expect(
        pagesService.list(mockUserId, { workspaceId: mockWorkspaceId, page: 1, limit: 10 }),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("list", () => {
    it("should return paginated pages for a workspace", async () => {
      vi.mocked(WorkspaceModel.findById).mockResolvedValueOnce({
        ownerId: mockUserId,
        memberIds: [],
      } as never);

      const mockFind = vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          skip: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ _id: "page-1", workspaceId: mockWorkspaceId }]),
          }),
        }),
      });

      vi.mocked(PageModel.find).mockImplementation(mockFind as never);
      vi.mocked(PageModel.countDocuments).mockResolvedValueOnce(1);

      const result = await pagesService.list(mockUserId, {
        workspaceId: mockWorkspaceId,
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe("create", () => {
    it("should successfully create a page", async () => {
      vi.mocked(WorkspaceModel.findById).mockResolvedValueOnce({
        ownerId: mockUserId,
        memberIds: [],
      } as never);

      // create() looks up the last sibling to compute the next order value
      vi.mocked(PageModel.findOne).mockReturnValueOnce({
        sort: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue({ order: 2 }) }),
        }),
      } as never);

      vi.mocked(PageModel.create).mockResolvedValueOnce({
        _id: "new-page",
        workspaceId: mockWorkspaceId,
        title: "Test Page",
        createdBy: mockUserId,
      } as never);

      const result = await pagesService.create(mockUserId, {
        workspaceId: mockWorkspaceId,
        title: "Test Page",
      });

      expect(result.id).toBe("new-page");
      expect(PageModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Page",
          workspaceId: mockWorkspaceId,
          // appended after the last sibling (order 2) -> 3
          order: 3,
        }),
      );
    });

    it("should throw ValidationError if parent page is in different workspace", async () => {
      vi.mocked(WorkspaceModel.findById).mockResolvedValueOnce({
        ownerId: mockUserId,
        memberIds: [],
      } as never);

      vi.mocked(PageModel.findById).mockResolvedValueOnce({
        workspaceId: "different-workspace",
        isArchived: false,
      } as never);

      await expect(
        pagesService.create(mockUserId, {
          workspaceId: mockWorkspaceId,
          parentPageId: "parent-1",
        }),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("search", () => {
    it("should throw ForbiddenError if user lacks workspace access", async () => {
      vi.mocked(WorkspaceModel.findById).mockResolvedValueOnce({
        ownerId: "other-user",
        memberIds: [],
      } as never);

      await expect(
        pagesService.search(mockUserId, { workspaceId: mockWorkspaceId, q: "hello", limit: 20 }),
      ).rejects.toThrow(ForbiddenError);
    });

    it("should use text search for queries of 3+ chars and return snippets", async () => {
      vi.mocked(WorkspaceModel.findById).mockResolvedValueOnce({
        ownerId: mockUserId,
        memberIds: [],
      } as never);

      const limit = vi.fn().mockResolvedValueOnce([
        {
          _id: "page-1",
          workspaceId: mockWorkspaceId,
          title: "Meeting notes",
          content: JSON.stringify({
            type: "doc",
            content: [
              { type: "paragraph", content: [{ type: "text", text: "Discuss the roadmap today" }] },
            ],
          }),
        },
      ]);
      const sort = vi.fn().mockReturnValue({ limit });
      const find = vi.fn().mockReturnValue({ sort });
      vi.mocked(PageModel.find).mockImplementation(find as never);

      const results = await pagesService.search(mockUserId, {
        workspaceId: mockWorkspaceId,
        q: "roadmap",
        limit: 20,
      });

      // Text query path: $text + textScore sort
      expect(find).toHaveBeenCalledWith(
        expect.objectContaining({ $text: { $search: "roadmap" }, isArchived: false }),
        expect.objectContaining({ score: expect.anything() }),
      );
      expect(results).toHaveLength(1);
      expect(results[0]?.snippet).toContain("roadmap");
    });

    it("should fall back to a title regex for short queries", async () => {
      vi.mocked(WorkspaceModel.findById).mockResolvedValueOnce({
        ownerId: mockUserId,
        memberIds: [],
      } as never);

      const limit = vi.fn().mockResolvedValueOnce([]);
      const find = vi.fn().mockReturnValue({ limit });
      vi.mocked(PageModel.find).mockImplementation(find as never);

      await pagesService.search(mockUserId, { workspaceId: mockWorkspaceId, q: "hi", limit: 20 });

      expect(find).toHaveBeenCalledWith(
        expect.objectContaining({
          title: { $regex: "hi", $options: "i" },
          isArchived: false,
        }),
      );
    });
  });

  describe("reorder", () => {
    it("should throw ForbiddenError if user lacks workspace access", async () => {
      vi.mocked(WorkspaceModel.findById).mockResolvedValueOnce({
        ownerId: "other-user",
        memberIds: [],
      } as never);

      await expect(
        pagesService.reorder(mockUserId, {
          workspaceId: mockWorkspaceId,
          orderedIds: ["a", "b"],
        }),
      ).rejects.toThrow(ForbiddenError);
      expect(PageModel.bulkWrite).not.toHaveBeenCalled();
    });

    it("should throw ValidationError if some ids are not in the workspace", async () => {
      vi.mocked(WorkspaceModel.findById).mockResolvedValueOnce({
        ownerId: mockUserId,
        memberIds: [],
      } as never);
      // Only one of the two requested ids is found
      const lean = vi.fn().mockResolvedValueOnce([{ _id: "a" }]);
      vi.mocked(PageModel.find).mockReturnValueOnce({ lean } as never);

      await expect(
        pagesService.reorder(mockUserId, {
          workspaceId: mockWorkspaceId,
          orderedIds: ["a", "b"],
        }),
      ).rejects.toThrow(ValidationError);
      expect(PageModel.bulkWrite).not.toHaveBeenCalled();
    });

    it("should set order by index and apply the parent via bulkWrite", async () => {
      vi.mocked(WorkspaceModel.findById).mockResolvedValueOnce({
        ownerId: mockUserId,
        memberIds: [],
      } as never);
      const lean = vi.fn().mockResolvedValueOnce([{ _id: "a" }, { _id: "b" }]);
      vi.mocked(PageModel.find).mockReturnValueOnce({ lean } as never);
      vi.mocked(PageModel.bulkWrite).mockResolvedValueOnce({} as never);

      await pagesService.reorder(mockUserId, {
        workspaceId: mockWorkspaceId,
        parentPageId: null,
        orderedIds: ["a", "b"],
      });

      expect(PageModel.bulkWrite).toHaveBeenCalledWith([
        { updateOne: { filter: { _id: "a" }, update: { $set: { order: 0, parentPageId: null } } } },
        { updateOne: { filter: { _id: "b" }, update: { $set: { order: 1, parentPageId: null } } } },
      ]);
    });
  });

  describe("permanentDelete", () => {
    it("should throw NotFoundError if page does not exist", async () => {
      vi.mocked(PageModel.findById).mockResolvedValueOnce(null);

      await expect(pagesService.permanentDelete("missing", mockUserId)).rejects.toThrow(
        NotFoundError,
      );
      expect(PageModel.deleteMany).not.toHaveBeenCalled();
    });

    it("should throw ForbiddenError if user lacks workspace access", async () => {
      vi.mocked(PageModel.findById).mockResolvedValueOnce({
        _id: "page-1",
        workspaceId: mockWorkspaceId,
      } as never);
      vi.mocked(WorkspaceModel.findById).mockResolvedValueOnce({
        ownerId: "other-user",
        memberIds: [],
      } as never);

      await expect(pagesService.permanentDelete("page-1", mockUserId)).rejects.toThrow(
        ForbiddenError,
      );
      expect(PageModel.deleteMany).not.toHaveBeenCalled();
    });

    it("should hard-delete the page together with all descendants", async () => {
      vi.mocked(PageModel.findById).mockResolvedValueOnce({
        _id: "page-1",
        workspaceId: mockWorkspaceId,
      } as never);
      vi.mocked(WorkspaceModel.findById).mockResolvedValueOnce({
        ownerId: mockUserId,
        memberIds: [],
      } as never);

      // First BFS batch returns one child, second batch returns none
      const leanChild = vi.fn().mockResolvedValueOnce([{ _id: "child-1" }]);
      const leanEmpty = vi.fn().mockResolvedValueOnce([]);
      vi.mocked(PageModel.find)
        .mockReturnValueOnce({ lean: leanChild } as never)
        .mockReturnValueOnce({ lean: leanEmpty } as never);
      vi.mocked(PageModel.deleteMany).mockResolvedValueOnce({ deletedCount: 2 } as never);

      await pagesService.permanentDelete("page-1", mockUserId);

      expect(PageModel.deleteMany).toHaveBeenCalledWith({
        _id: { $in: ["page-1", "child-1"] },
      });
    });
  });
});
