import { Schema, model, type Document } from "mongoose";
import type { Page } from "@tatalaku/shared";

export interface PageDocument extends Omit<Page, "id">, Document {}

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

// Text index for full-text search across title + content. Title is weighted
// higher so matches in the heading rank above matches deep in the body.
pageSchema.index({ title: "text", content: "text" }, { weights: { title: 10, content: 1 } });

export const PageModel = model<PageDocument>("Page", pageSchema);
