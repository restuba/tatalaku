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
  isFavorite: z.boolean().optional(),
  isFullWidth: z.boolean().optional(),
});

export const pageParamsSchema = z.object({
  pageId: z.string().min(1),
});
export const searchPagesSchema = z.object({
  workspaceId: z.string().min(1),
  q: z.string().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export const pageTreeQuerySchema = z.object({
  workspaceId: z.string().min(1),
  archived: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .default(false),
});
export const reorderPagesSchema = z.object({
  workspaceId: z.string().min(1),
  parentPageId: z.string().nullable().optional(),
  orderedIds: z.array(z.string().min(1)).min(1).max(500),
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
export type SearchPagesQuery = z.infer<typeof searchPagesSchema>;
export type ReorderPagesInput = z.infer<typeof reorderPagesSchema>;
export type PageTreeQuery = z.infer<typeof pageTreeQuerySchema>;
