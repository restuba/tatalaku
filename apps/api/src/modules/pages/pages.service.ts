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
  SearchPagesQuery,
  ReorderPagesInput,
} from "./pages.validation.js";

export interface PageSearchResult extends Page {
  /** Short plaintext excerpt of the content around the match, if any */
  snippet: string | null;
}

/**
 * Extracts readable plaintext from a stored Tiptap JSON document so we can
 * build a human-friendly snippet. Falls back to the raw string on parse error.
 */
function contentToPlainText(content: string | null): string {
  if (!content) return "";
  try {
    const doc = JSON.parse(content);
    const parts: string[] = [];
    const walk = (node: unknown): void => {
      if (!node || typeof node !== "object") return;
      const n = node as { text?: unknown; content?: unknown };
      if (typeof n.text === "string") parts.push(n.text);
      if (Array.isArray(n.content)) n.content.forEach(walk);
    };
    walk(doc);
    return parts.join(" ").replace(/\s+/g, " ").trim();
  } catch {
    return content.replace(/\s+/g, " ").trim();
  }
}

/** Builds a ~160 char excerpt centered on the first match of `query`. */
function buildSnippet(plain: string, query: string): string | null {
  if (!plain) return null;
  const idx = plain.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) {
    return plain.length > 160 ? `${plain.slice(0, 160)}…` : plain;
  }
  const start = Math.max(0, idx - 60);
  const end = Math.min(plain.length, idx + query.length + 100);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < plain.length ? "…" : "";
  return `${prefix}${plain.slice(start, end)}${suffix}`;
}

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
    order: doc.order ?? 0,
    isArchived: doc.isArchived,
    isFavorite: doc.isFavorite ?? false,
    isFullWidth: doc.isFullWidth ?? false,
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
      PageModel.find(filter).sort({ order: 1, createdAt: 1 }).skip(skip).limit(query.limit),
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
   * Full-text search over non-archived pages in a workspace. Matches titles
   * and content; short queries (< 3 chars) fall back to a title prefix regex
   * since MongoDB text search ignores very short / stop-word terms.
   */
  async search(userId: string, query: SearchPagesQuery): Promise<PageSearchResult[]> {
    await this.assertWorkspaceAccess(query.workspaceId, userId);

    const q = query.q.trim();
    const base = { workspaceId: query.workspaceId, isArchived: false };

    let docs: PageDocument[];
    if (q.length < 3) {
      // Text index skips short terms, so do a case-insensitive title match
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      docs = await PageModel.find({ ...base, title: { $regex: safe, $options: "i" } }).limit(
        query.limit,
      );
    } else {
      docs = await PageModel.find(
        { ...base, $text: { $search: q } },
        { score: { $meta: "textScore" } },
      )
        .sort({ score: { $meta: "textScore" } })
        .limit(query.limit);
    }

    return docs.map((doc) => {
      const plain = contentToPlainText(doc.content ?? null);
      return { ...toPageResponse(doc), snippet: buildSnippet(plain, q) };
    });
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
      .sort({ order: 1, createdAt: 1, _id: 1 })
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

    // Append after the last sibling so new pages land at the bottom of the list
    const lastSibling = await PageModel.findOne({
      workspaceId: input.workspaceId,
      parentPageId: input.parentPageId ?? null,
    })
      .sort({ order: -1 })
      .select("order")
      .lean();
    const nextOrder = (lastSibling?.order ?? -1) + 1;

    const doc = await PageModel.create({
      workspaceId: input.workspaceId,
      parentPageId: input.parentPageId ?? null,
      title: input.title?.trim() || "Untitled",
      icon: input.icon ?? null,
      coverImage: null,
      content: null,
      createdBy: userId,
      order: nextOrder,
      isArchived: false,
      isFavorite: false,
      isFullWidth: false,
    });

    return toPageResponse(doc);
  }

  /**
   * Reorder sibling pages (and optionally reparent them). `orderedIds` is the
   * full desired order of the pages that should live under `parentPageId`;
   * each page's `order` is set to its index, and its parent is updated to
   * `parentPageId`. All pages must belong to the workspace.
   */
  async reorder(userId: string, input: ReorderPagesInput): Promise<void> {
    await this.assertWorkspaceAccess(input.workspaceId, userId);

    if (input.orderedIds.length === 0) return;

    // Validate every page belongs to this workspace and isn't archived
    const docs = await PageModel.find(
      { _id: { $in: input.orderedIds }, workspaceId: input.workspaceId, isArchived: false },
      { _id: 1 },
    ).lean();

    if (docs.length !== input.orderedIds.length) {
      throw new ValidationError("All pages must belong to the same workspace");
    }

    // Guard against moving a page into one of its own descendants
    if (input.parentPageId) {
      if (input.orderedIds.includes(input.parentPageId)) {
        throw new ValidationError("A page cannot be its own parent");
      }
      let currentParentId: string | null = input.parentPageId;
      const movingSet = new Set(input.orderedIds);
      while (currentParentId) {
        if (movingSet.has(currentParentId)) {
          throw new ValidationError("Cannot move a page into one of its subpages");
        }
        const next: { parentPageId?: string | null } | null = await PageModel.findById(
          currentParentId,
          { parentPageId: 1 },
        ).lean();
        currentParentId = next?.parentPageId ?? null;
      }
    }

    await PageModel.bulkWrite(
      input.orderedIds.map((id, index) => ({
        updateOne: {
          filter: { _id: id },
          update: { $set: { order: index, parentPageId: input.parentPageId ?? null } },
        },
      })),
    );
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

    if (input.isFavorite !== undefined) {
      doc.isFavorite = input.isFavorite;
    }

    if (input.isFullWidth !== undefined) {
      doc.isFullWidth = input.isFullWidth;
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
   * Helper to archive all descendant pages in bulk (BFS, no N+1)
   */
  private async archiveDescendants(parentId: string, workspaceId: string): Promise<void> {
    // BFS to collect all descendant IDs
    const queue = [parentId];
    const allDescendantIds: string[] = [];

    while (queue.length > 0) {
      const currentBatch = [...queue];
      queue.length = 0;

      const children = await PageModel.find(
        { parentPageId: { $in: currentBatch }, workspaceId, isArchived: false },
        { _id: 1 },
      ).lean();

      for (const child of children) {
        const childId = child._id.toString();
        allDescendantIds.push(childId);
        queue.push(childId);
      }
    }

    // Single bulk update for all descendants
    if (allDescendantIds.length > 0) {
      await PageModel.updateMany(
        { _id: { $in: allDescendantIds } },
        { $set: { isArchived: true } },
      );
    }
  }

  /**
   * Permanently delete a page and all its descendants (hard delete, irreversible)
   */
  async permanentDelete(pageId: string, userId: string): Promise<void> {
    const doc = await PageModel.findById(pageId);
    if (!doc) {
      throw new NotFoundError("Page");
    }

    await this.assertWorkspaceAccess(doc.workspaceId, userId);

    // Collect this page + all descendants, then delete in one bulk op
    const idsToDelete = [pageId, ...(await this.collectDescendantIds(pageId, doc.workspaceId))];
    await PageModel.deleteMany({ _id: { $in: idsToDelete } });
  }

  /**
   * Helper: collect all descendant page IDs (BFS, no N+1). Includes archived
   * descendants so a permanent delete leaves nothing orphaned behind.
   */
  private async collectDescendantIds(parentId: string, workspaceId: string): Promise<string[]> {
    const queue = [parentId];
    const descendantIds: string[] = [];

    while (queue.length > 0) {
      const currentBatch = [...queue];
      queue.length = 0;

      const children = await PageModel.find(
        { parentPageId: { $in: currentBatch }, workspaceId },
        { _id: 1 },
      ).lean();

      for (const child of children) {
        const childId = child._id.toString();
        descendantIds.push(childId);
        queue.push(childId);
      }
    }

    return descendantIds;
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
