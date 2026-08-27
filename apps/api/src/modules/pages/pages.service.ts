import mongoose from "mongoose";
import type { Page, PaginatedResponse, CursorPaginatedResponse } from "@tatalaku/shared";
import { PageModel, type PageDocument } from "./pages.model.js";
import { WorkspaceModel } from "../workspaces/workspaces.model.js";
import { ForbiddenError, NotFoundError, ValidationError } from "../../utils/errors.js";
import type {
  CreatePageInput,
  UpdatePageInput,
  ListPagesQuery,
  GetChildrenQuery,
} from "./pages.validation.js";

function toPageResponse(doc: PageDocument): Page {
  return {
    id: doc._id.toString(),
    workspaceId: doc.workspaceId,
    parentPageId: doc.parentPageId ?? null,
    title: doc.title,
    icon: doc.icon ?? null,
    coverImage: doc.coverImage ?? null,
    content: doc.content ?? null,
    createdBy: doc.createdBy,
    isArchived: doc.isArchived,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class PagesService {
  /**
   * Helper: verify user is owner or member of the workspace
   */
  private async assertWorkspaceAccess(workspaceId: string, userId: string): Promise<void> {
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace");
    }

    const isMember = workspace.ownerId === userId || workspace.memberIds.includes(userId);
    if (!isMember) {
      throw new ForbiddenError("You do not have access to this workspace");
    }
  }

  /**
   * List pages in a workspace (with optional parentPageId filter and archived toggle)
   */
  async list(userId: string, query: ListPagesQuery): Promise<PaginatedResponse<Page>> {
    await this.assertWorkspaceAccess(query.workspaceId, userId);

    const filter: Record<string, unknown> = {
      workspaceId: query.workspaceId,
      isArchived: query.includeArchived ? { $in: [true, false] } : false,
    };

    if (query.parentPageId !== undefined) {
      filter["parentPageId"] = query.parentPageId;
    }

    const skip = (query.page - 1) * query.limit;

    const [docs, total] = await Promise.all([
      PageModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit),
      PageModel.countDocuments(filter),
    ]);

    return {
      data: docs.map(toPageResponse),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  /**
   * Get direct children of a page (cursor paginated)
   */
  async getChildren(
    pageId: string,
    userId: string,
    query: GetChildrenQuery,
  ): Promise<CursorPaginatedResponse<Page>> {
    const parent = await PageModel.findById(pageId);
    if (!parent) {
      throw new NotFoundError("Page");
    }

    await this.assertWorkspaceAccess(parent.workspaceId, userId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {
      workspaceId: parent.workspaceId,
      parentPageId: pageId,
      isArchived: false,
    };

    if (query.cursor) {
      const decoded = Buffer.from(query.cursor, "base64").toString("utf-8");
      const [timeStr, idStr] = decoded.split("_");
      if (timeStr && idStr && mongoose.isValidObjectId(idStr)) {
        const date = new Date(parseInt(timeStr, 10));
        filter.$or = [
          { createdAt: { $gt: date } },
          { createdAt: date, _id: { $gt: new mongoose.Types.ObjectId(idStr) } },
        ];
      }
    }

    const docs = await PageModel.find(filter)
      .sort({ createdAt: 1, _id: 1 })
      .limit(query.limit + 1);

    const hasMore = docs.length > query.limit;
    if (hasMore) {
      docs.pop();
    }

    let nextCursor: string | null = null;
    if (hasMore && docs.length > 0) {
      const lastDoc = docs[docs.length - 1]!;
      nextCursor = Buffer.from(
        `${new Date(lastDoc.createdAt).getTime()}_${lastDoc._id.toString()}`,
      ).toString("base64");
    }

    return {
      data: docs.map(toPageResponse),
      meta: {
        nextCursor,
        hasMore,
      },
    };
  }

  /**
   * Create a new page
   */
  async create(userId: string, input: CreatePageInput): Promise<Page> {
    await this.assertWorkspaceAccess(input.workspaceId, userId);

    if (input.parentPageId) {
      const parent = await PageModel.findById(input.parentPageId);
      if (!parent || parent.isArchived) {
        throw new NotFoundError("Parent page");
      }
      if (parent.workspaceId !== input.workspaceId) {
        throw new ValidationError("Parent page must belong to the same workspace");
      }
    }

    const doc = await PageModel.create({
      workspaceId: input.workspaceId,
      parentPageId: input.parentPageId ?? null,
      title: input.title?.trim() || "Untitled",
      icon: input.icon ?? null,
      coverImage: null,
      content: null,
      createdBy: userId,
      isArchived: false,
    });

    return toPageResponse(doc);
  }

  /**
   * Get page by ID
   */
  async getById(pageId: string, userId: string): Promise<Page> {
    const doc = await PageModel.findById(pageId);
    if (!doc) {
      throw new NotFoundError("Page");
    }

    await this.assertWorkspaceAccess(doc.workspaceId, userId);

    return toPageResponse(doc);
  }

  /**
   * Update page metadata (title, icon, coverImage, parentPageId, isArchived)
   */
  async update(pageId: string, userId: string, input: UpdatePageInput): Promise<Page> {
    const doc = await PageModel.findById(pageId);
    if (!doc) {
      throw new NotFoundError("Page");
    }

    await this.assertWorkspaceAccess(doc.workspaceId, userId);

    if (input.parentPageId !== undefined) {
      if (input.parentPageId === pageId) {
        throw new ValidationError("A page cannot be its own parent");
      }

      if (input.parentPageId !== null) {
        const parent = await PageModel.findById(input.parentPageId);
        if (!parent || parent.isArchived) {
          throw new NotFoundError("Parent page");
        }
        if (parent.workspaceId !== doc.workspaceId) {
          throw new ValidationError("Parent page must belong to the same workspace");
        }

        // Prevent circular hierarchy
        let currentParentId: string | null = parent.parentPageId ?? null;
        while (currentParentId) {
          if (currentParentId === pageId) {
            throw new ValidationError("Cannot move a page into one of its subpages");
          }
          const nextParent = await PageModel.findById(currentParentId);
          currentParentId = nextParent?.parentPageId ?? null;
        }
      }

      doc.parentPageId = input.parentPageId;
    }

    if (input.title !== undefined) {
      doc.title = input.title.trim() || "Untitled";
    }

    if (input.icon !== undefined) {
      doc.icon = input.icon;
    }

    if (input.coverImage !== undefined) {
      doc.coverImage = input.coverImage;
    }

    if (input.content !== undefined) {
      doc.content = input.content;
    }

    if (input.isArchived !== undefined) {
      doc.isArchived = input.isArchived;
    }

    await doc.save();
    return toPageResponse(doc);
  }

  /**
   * Soft delete / archive a page and all its descendants
   */
  async archive(pageId: string, userId: string): Promise<Page> {
    const doc = await PageModel.findById(pageId);
    if (!doc) {
      throw new NotFoundError("Page");
    }

    await this.assertWorkspaceAccess(doc.workspaceId, userId);

    // Archive this page
    doc.isArchived = true;
    await doc.save();

    // Recursively archive descendants
    await this.archiveDescendants(pageId, doc.workspaceId);

    return toPageResponse(doc);
  }

  /**
   * Helper to recursively archive descendant pages
   */
  private async archiveDescendants(parentId: string, workspaceId: string): Promise<void> {
    const children = await PageModel.find({ parentPageId: parentId, workspaceId });
    for (const child of children) {
      child.isArchived = true;
      await child.save();
      await this.archiveDescendants(child._id.toString(), workspaceId);
    }
  }

  /**
   * Restore an archived page
   */
  async restore(pageId: string, userId: string): Promise<Page> {
    const doc = await PageModel.findById(pageId);
    if (!doc) {
      throw new NotFoundError("Page");
    }

    await this.assertWorkspaceAccess(doc.workspaceId, userId);

    doc.isArchived = false;
    await doc.save();

    return toPageResponse(doc);
  }
}

export const pagesService = new PagesService();
