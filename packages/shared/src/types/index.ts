import { z } from "zod";
import { UserSchema } from "../schemas/user.schema.js";
import { WorkspaceSchema } from "../schemas/workspace.schema.js";
import { PageSchema } from "../schemas/page.schema.js";
import { BlockSchema, BlockTypeSchema } from "../schemas/block.schema.js";

export type User = z.infer<typeof UserSchema>;
export type Workspace = z.infer<typeof WorkspaceSchema>;
export type Page = z.infer<typeof PageSchema>;
export type Block = z.infer<typeof BlockSchema>;
export type BlockType = z.infer<typeof BlockTypeSchema>;
