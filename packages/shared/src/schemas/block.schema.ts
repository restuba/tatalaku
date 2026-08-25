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

const BaseBlock = z.object({
  id: z.string(),
  pageId: z.string(),
  order: z.number(),
  parentBlockId: z.string().nullable().optional(),
});

const TiptapNodeSchema = z.array(z.record(z.string(), z.unknown())).nullable().optional();

export const BlockSchema = z.discriminatedUnion("type", [
  BaseBlock.extend({ type: z.literal("paragraph"), content: TiptapNodeSchema }),
  BaseBlock.extend({ type: z.literal("heading1"), content: TiptapNodeSchema }),
  BaseBlock.extend({ type: z.literal("heading2"), content: TiptapNodeSchema }),
  BaseBlock.extend({ type: z.literal("heading3"), content: TiptapNodeSchema }),
  BaseBlock.extend({ type: z.literal("bulletList"), content: TiptapNodeSchema }),
  BaseBlock.extend({ type: z.literal("numberedList"), content: TiptapNodeSchema }),
  BaseBlock.extend({ type: z.literal("todo"), content: TiptapNodeSchema }),
  BaseBlock.extend({ type: z.literal("toggle"), content: TiptapNodeSchema }),
  BaseBlock.extend({ type: z.literal("code"), content: TiptapNodeSchema }),
  BaseBlock.extend({ type: z.literal("quote"), content: TiptapNodeSchema }),
  BaseBlock.extend({
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
  BaseBlock.extend({ type: z.literal("divider"), content: z.null().optional() }),
]);
