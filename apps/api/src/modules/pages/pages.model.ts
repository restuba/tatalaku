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
    icon: {
      type: String,
      default: null,
    },
    coverImage: {
      type: String,
      default: null,
    },
    blockIds: {
      type: [String],
      default: [],
    },
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
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    versionKey: false,
  },
);

// Compound index: most page list queries filter by workspaceId + isArchived
pageSchema.index({ workspaceId: 1, isArchived: 1 });

export const PageModel = model<PageDocument>("Page", pageSchema);
