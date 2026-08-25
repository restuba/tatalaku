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
});
