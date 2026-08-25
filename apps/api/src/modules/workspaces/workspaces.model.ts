import { Schema, model, type Document } from "mongoose";
import type { Workspace } from "@tatalaku/shared";

export interface WorkspaceDocument extends Omit<Workspace, "id">, Document {}

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
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
    versionKey: false,
  },
);

export const WorkspaceModel = model<WorkspaceDocument>("Workspace", workspaceSchema);
