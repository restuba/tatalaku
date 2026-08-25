import { Schema, model, type Document } from "mongoose";
import { BlockTypeSchema } from "@tatalaku/shared";
import type { Block } from "@tatalaku/shared";

export interface BlockDocument extends Omit<Block, "id">, Document {}

// Derive array of valid block types from the shared Zod enum at runtime
const blockTypeValues = BlockTypeSchema.options;

const blockSchema = new Schema<BlockDocument>(
  {
    pageId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: blockTypeValues,
    },
    // content is deliberately untyped (Mixed) because it varies per block type.
    // Validation of content shape is handled in the service layer via Zod.
    content: {
      type: Schema.Types.Mixed,
      default: null,
    },
    order: {
      type: Number,
      required: true,
    },
    parentBlockId: {
      type: String,
      default: null,
      index: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

// Compound index: blocks are almost always fetched sorted by pageId + order
blockSchema.index({ pageId: 1, order: 1 });

export const BlockModel = model<BlockDocument>("Block", blockSchema);
