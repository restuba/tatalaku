import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1, "Name is required"),
  avatarUrl: z.string().url().nullable(),
  createdAt: z.date().or(z.string()),
});
