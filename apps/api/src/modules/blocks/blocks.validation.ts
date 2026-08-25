import { z } from "zod";
import { BlockTypeSchema } from "@tatalaku/shared";

const BaseCreateBlock = z.object({
  pageId: z.string().min(1),
  order: z.number().int().nonnegative(),
  parentBlockId: z.string().nullable().optional(),
});

const TiptapNodeSchema = z.array(z.record(z.string(), z.unknown())).optional();

export const createBlockSchema = z.discriminatedUnion("type", [
  BaseCreateBlock.extend({ type: z.literal("paragraph"), content: TiptapNodeSchema }),
  BaseCreateBlock.extend({ type: z.literal("heading1"), content: TiptapNodeSchema }),
  BaseCreateBlock.extend({ type: z.literal("heading2"), content: TiptapNodeSchema }),
  BaseCreateBlock.extend({ type: z.literal("heading3"), content: TiptapNodeSchema }),
  BaseCreateBlock.extend({ type: z.literal("bulletList"), content: TiptapNodeSchema }),
  BaseCreateBlock.extend({ type: z.literal("numberedList"), content: TiptapNodeSchema }),
  BaseCreateBlock.extend({ type: z.literal("todo"), content: TiptapNodeSchema }),
  BaseCreateBlock.extend({ type: z.literal("toggle"), content: TiptapNodeSchema }),
  BaseCreateBlock.extend({ type: z.literal("code"), content: TiptapNodeSchema }),
  BaseCreateBlock.extend({ type: z.literal("quote"), content: TiptapNodeSchema }),
  BaseCreateBlock.extend({
    type: z.literal("image"),
    content: z
      .object({
        src: z.string().optional(),
        alt: z.string().optional(),
        title: z.string().optional(),
      })
      .catchall(z.unknown())
      .nullable()
      .optional(),
  }),
  BaseCreateBlock.extend({ type: z.literal("divider"), content: z.null().optional() }),
]);

export const updateBlockSchema = z.object({
  type: BlockTypeSchema.optional(),
  content: z.unknown().optional(),
  order: z.number().int().nonnegative().optional(),
  parentBlockId: z.string().nullable().optional(),
});

export const blockParamsSchema = z.object({
  blockId: z.string().min(1),
});

export const pageBlockParamsSchema = z.object({
  pageId: z.string().min(1),
});

export const reorderBlocksSchema = z.object({
  pageId: z.string().min(1),
  blocks: z.array(
    z.object({
      id: z.string().min(1),
      order: z.number().int().nonnegative(),
    }),
  ),
});

const BaseSyncBlock = z.object({
  id: z.string().optional(),
  order: z.number().int().nonnegative(),
  parentBlockId: z.string().nullable().optional(),
});

const syncBlockItemSchema = z.discriminatedUnion("type", [
  BaseSyncBlock.extend({ type: z.literal("paragraph"), content: TiptapNodeSchema }),
  BaseSyncBlock.extend({ type: z.literal("heading1"), content: TiptapNodeSchema }),
  BaseSyncBlock.extend({ type: z.literal("heading2"), content: TiptapNodeSchema }),
  BaseSyncBlock.extend({ type: z.literal("heading3"), content: TiptapNodeSchema }),
  BaseSyncBlock.extend({ type: z.literal("bulletList"), content: TiptapNodeSchema }),
  BaseSyncBlock.extend({ type: z.literal("numberedList"), content: TiptapNodeSchema }),
  BaseSyncBlock.extend({ type: z.literal("todo"), content: TiptapNodeSchema }),
  BaseSyncBlock.extend({ type: z.literal("toggle"), content: TiptapNodeSchema }),
  BaseSyncBlock.extend({ type: z.literal("code"), content: TiptapNodeSchema }),
  BaseSyncBlock.extend({ type: z.literal("quote"), content: TiptapNodeSchema }),
  BaseSyncBlock.extend({
    type: z.literal("image"),
    content: z
      .object({
        src: z.string().optional(),
        alt: z.string().optional(),
        title: z.string().optional(),
      })
      .catchall(z.unknown())
      .nullable()
      .optional(),
  }),
  BaseSyncBlock.extend({ type: z.literal("divider"), content: z.null().optional() }),
]);

export const batchSyncBlocksSchema = z.object({
  blocks: z.array(syncBlockItemSchema),
});

export type CreateBlockInput = z.infer<typeof createBlockSchema>;
export type UpdateBlockInput = z.infer<typeof updateBlockSchema>;
export type ReorderBlocksInput = z.infer<typeof reorderBlocksSchema>;
export type BatchSyncBlocksInput = z.infer<typeof batchSyncBlocksSchema>;
