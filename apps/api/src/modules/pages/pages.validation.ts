import { z } from "zod";

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
  parentPageId: z.string().nullable().optional(),
});

export const pageParamsSchema = z.object({
  pageId: z.string().min(1),
});

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
