import { z } from "zod";

export const PageSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  parentPageId: z.string().nullable(),
  title: z.string(),
  icon: z.string().nullable(),
  coverImage: z.string().url().nullable(),
  content: z.string().nullable(),
  createdBy: z.string(),
  isArchived: z.boolean().default(false),
  isFavorite: z.boolean().default(false),
  isFullWidth: z.boolean().default(false),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});
