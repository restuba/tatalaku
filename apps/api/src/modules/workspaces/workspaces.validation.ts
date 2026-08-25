import { z } from "zod";
import { PaginationQuerySchema } from "@tatalaku/shared";

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100).optional(),
});

export const workspaceParamsSchema = z.object({
  workspaceId: z.string().min(1),
});

export const listWorkspacesQuerySchema = PaginationQuerySchema;

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
