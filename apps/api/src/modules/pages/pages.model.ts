import { Schema, model, type Document } from "mongoose";
import type { Page } from "@tatalaku/shared";

export interface PageDocument extends Omit<Page, "id">, Document {
  /**
   * Server-only plaintext extracted from `content`, used for full-text search.
   * Never sent to clients (not part of the shared Page type).
   */
  plainText?: string;
}

const pageSchema = new Schema<PageDocument>(
  {
    workspaceId: {
      type: String,
      required: true,
      index: true,
    },
    parentPageId: {
      type: String,
      default: null,
      index: true,
    },
    title: {
      type: String,
      default: "Untitled",
    },
    icon: { type: String, default: null },
    coverImage: { type: String, default: null },
    content: { type: String, default: null },
    // Derived from `content` on save; excluded from queries unless selected
    plainText: { type: String, default: "", select: false },
    order: { type: Number, default: 0 },
    createdBy: {
      type: String,
      required: true,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      // Index: queries always filter out archived pages
      index: true,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isFullWidth: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    versionKey: false,
  },
);

// Compound index: most page list queries filter by workspaceId + isArchived
pageSchema.index({ workspaceId: 1, isArchived: 1 });

// Index for ordered tree reads (siblings under a parent, sorted by order)
pageSchema.index({ workspaceId: 1, parentPageId: 1, order: 1 });

// Text index for full-text search across title + plaintext body. Indexing the
// raw Tiptap JSON would also match structural keys ("paragraph", "text", ...).
// Title is weighted higher so heading matches rank above body matches.
// Changing this index requires `pnpm --filter @tatalaku/api migrate:page-search`.
pageSchema.index(
  { title: "text", plainText: "text" },
  { name: "page_search_text", weights: { title: 10, plainText: 1 } },
);

export const PageModel = model<PageDocument>("Page", pageSchema);
