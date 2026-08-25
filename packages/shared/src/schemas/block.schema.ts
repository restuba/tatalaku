import { z } from "zod";

export const BlockTypeSchema = z.enum([
  "paragraph",
  "heading1",
  "heading2",
  "heading3",
  "bulletList",
  "numberedList",
  "todo",
  "toggle",
  "image",
  "code",
  "quote",
  "divider",
]);

export const BlockSchema = z.object({
  id: z.string(),
  pageId: z.string(),
  type: BlockTypeSchema,
  // content is flexible based on the type (e.g., text, url for image, checked state for todo)
  content: z.any().optional(),
  order: z.number(),
  parentBlockId: z.string().nullable().optional(),
});
