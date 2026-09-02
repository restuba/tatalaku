import { z } from "zod";
import { PaginationQuerySchema, CursorPaginationQuerySchema } from "@tatalaku/shared";

export const getChildrenQuerySchema = CursorPaginationQuerySchema;

export const createPageSchema = z.object({
  workspaceId: z.string().min(1),
  parentPageId: z.string().nullable().optional(),
  title: z.string().max(500).optional(),
  icon: z.string().nullable().optional(),
});

export const updatePageSchema = z.object({
  title: z.string().max(500).optional(),
  icon: z.string().nullable().optional(),
  coverImage: z.string().url().nullable().optional(),
  content: z.string().nullable().optional(),
  parentPageId: z.string().nullable().optional(),
  isArchived: z.boolean().optional(),
  isFullWidth: z.boolean().optional(),
});

export const pageParamsSchema = z.object({
  pageId: z.string().min(1),
});
export const listPagesQuerySchema = z
  .object({
    workspaceId: z.string().min(1),
    parentPageId: z.string().nullable().optional(),
    includeArchived: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .optional(),
  })
  .merge(PaginationQuerySchema);

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type ListPagesQuery = z.infer<typeof listPagesQuerySchema>;
export type GetChildrenQuery = z.infer<typeof getChildrenQuerySchema>;
