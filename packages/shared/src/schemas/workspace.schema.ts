import { z } from "zod";

export const WorkspaceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Workspace name is required"),
  ownerId: z.string(),
  memberIds: z.array(z.string()),
  createdAt: z.date().or(z.string()),
});
