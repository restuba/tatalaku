import { z } from "zod";
import {
  UserSchema,
  WorkspaceSchema,
  PageSchema,
  BlockSchema,
  BlockTypeSchema,
} from "../schemas/index.js";

export type User = z.infer<typeof UserSchema>;
export type Workspace = z.infer<typeof WorkspaceSchema>;
export type PendingInvite = NonNullable<Workspace["pendingInvites"]>[number];
export type Page = z.infer<typeof PageSchema>;
export type Block = z.infer<typeof BlockSchema>;
export type BlockType = z.infer<typeof BlockTypeSchema>;

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
  };
}
