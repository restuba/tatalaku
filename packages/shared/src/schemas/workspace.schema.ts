import { z } from "zod";

export const WorkspaceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Workspace name is required"),
  ownerId: z.string(),
  memberIds: z.array(z.string()),
  pendingInvites: z
    .array(
      z.object({
        email: z.string().email(),
        token: z.string(),
        invitedAt: z.date().or(z.string()),
      }),
    )
    .optional()
    .default([]),
  createdAt: z.date().or(z.string()),
});
