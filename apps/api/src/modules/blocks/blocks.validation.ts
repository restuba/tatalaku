import { z } from "zod";
import { BlockTypeSchema } from "@tatalaku/shared";

export const createBlockSchema = z.object({
  pageId: z.string().min(1),
  type: BlockTypeSchema,
  content: z.unknown().optional(),
  order: z.number().int().nonnegative(),
  parentBlockId: z.string().nullable().optional(),
});

export const updateBlockSchema = z.object({
  content: z.unknown().optional(),
  order: z.number().int().nonnegative().optional(),
  parentBlockId: z.string().nullable().optional(),
});

export const blockParamsSchema = z.object({
  blockId: z.string().min(1),
});

export const reorderBlocksSchema = z.object({
  // Array of { id, order } tuples for bulk reorder
  blocks: z.array(
    z.object({
      id: z.string().min(1),
      order: z.number().int().nonnegative(),
    }),
  ),
});

export type CreateBlockInput = z.infer<typeof createBlockSchema>;
export type UpdateBlockInput = z.infer<typeof updateBlockSchema>;
