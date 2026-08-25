import { Schema, model, type Document } from "mongoose";
import type { User } from "@tatalaku/shared";

export interface UserDocument extends Omit<User, "id">, Document {}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    // passwordHash stored separately — not part of the shared User type (not exposed to clients)
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
    versionKey: false,
  },
);

export const UserModel = model<UserDocument>("User", userSchema);
