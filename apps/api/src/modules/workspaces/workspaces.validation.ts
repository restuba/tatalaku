import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(255),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(255).optional(),
});

export const workspaceParamsSchema = z.object({
  workspaceId: z.string().min(1),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
