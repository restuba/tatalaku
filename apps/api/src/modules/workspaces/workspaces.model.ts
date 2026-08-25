import { Schema, model, type Document, type Types } from "mongoose";
import type { Workspace } from "@tatalaku/shared";

export interface PendingInviteSubDoc {
  email: string;
  token: string;
  invitedAt: Date;
}

export interface WorkspaceDocument extends Omit<Workspace, "id" | "pendingInvites">, Document {
  pendingInvites: Types.DocumentArray<PendingInviteSubDoc & Document>;
}

const workspaceSchema = new Schema<WorkspaceDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ownerId: {
      type: String,
      required: true,
      // Index: queries like "get workspaces owned by user" are frequent
      index: true,
    },
    memberIds: {
      type: [String],
      default: [],
      // Index: queries like "get workspaces where user is a member" are frequent
      index: true,
    },
    pendingInvites: {
      type: [
        {
          email: { type: String, required: true },
          token: { type: String, required: true },
          invitedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
    versionKey: false,
  },
);

export const WorkspaceModel = model<WorkspaceDocument>("Workspace", workspaceSchema);
