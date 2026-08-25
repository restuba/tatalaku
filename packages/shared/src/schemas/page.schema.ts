import { z } from "zod";

export const PageSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  parentPageId: z.string().nullable(),
  title: z.string(),
  icon: z.string().nullable(),
  coverImage: z.string().url().nullable(),
  blockIds: z.array(z.string()),
  createdBy: z.string(),
  isArchived: z.boolean().default(false),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});
